import { expect, test, type Download } from '@playwright/test'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const samplePath = path.resolve(__dirname, '../sample.xlsx')

const readDownloadBuffer = async (download: Download) => {
  const downloadPath = await download.path()
  const tempPath =
    downloadPath ??
    path.join(
      os.tmpdir(),
      `farsifix-${Date.now()}-${Math.random().toString(16).slice(2)}.xlsx`
    )

  if (!downloadPath) {
    await download.saveAs(tempPath)
  }

  const buffer = await fs.readFile(tempPath)

  if (!downloadPath) {
    await fs.unlink(tempPath)
  }

  return buffer
}

const createTempWorkbook = async (text: string) => {
  const zip = new JSZip()
  zip.file(
    'xl/sharedStrings.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="1" uniqueCount="1"><si><t>${text}</t></si></sst>`
  )
  zip.file(
    'xl/worksheets/sheet1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n  <sheetData>\n    <row r="1">\n      <c r="A1" t="inlineStr"><is><t>${text}</t></is></c>\n    </row>\n  </sheetData>\n</worksheet>`
  )
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>\n</Types>`
  )

  const buffer = await zip.generateAsync({ type: 'nodebuffer' })
  const tempPath = path.join(
    os.tmpdir(),
    `farsifix-entity-${Date.now()}-${Math.random().toString(16).slice(2)}.xlsx`
  )
  await fs.writeFile(tempPath, buffer)
  return {
    path: tempPath,
    cleanup: async () => {
      await fs.unlink(tempPath)
    },
  }
}

test('uploads and downloads normalized excel', async ({ page }) => {
  await page.goto('/')

  const downloadPromise = page.waitForEvent('download')
  await page.setInputFiles('[data-testid="file-input"]', samplePath)
  const download = await downloadPromise

  await expect(download.suggestedFilename()).toBe('sample_FarsiFix.xlsx')
  const buffer = await readDownloadBuffer(download)
  const zip = await JSZip.loadAsync(buffer)
  const sharedStrings = await zip.file('xl/sharedStrings.xml')?.async('string')

  expect(sharedStrings).toBeDefined()
  // Confirm normalized token exists and original Arabic-yeh variant is gone.
  expect(sharedStrings).toContain('بالالاریجان')
  expect(sharedStrings).not.toContain('بالالاريجان')
})

test('preserves XML entities in sharedStrings and inline strings', async ({ page }) => {
  const { path: inputPath, cleanup } = await createTempWorkbook('سلام &amp; دنيا')

  await page.goto('/')
  const downloadPromise = page.waitForEvent('download')
  await page.setInputFiles('[data-testid="file-input"]', inputPath)
  const download = await downloadPromise

  const buffer = await readDownloadBuffer(download)
  const zip = await JSZip.loadAsync(buffer)
  const sharedStrings = await zip.file('xl/sharedStrings.xml')?.async('string')
  const sheet = await zip.file('xl/worksheets/sheet1.xml')?.async('string')

  expect(sharedStrings).toBeDefined()
  expect(sheet).toBeDefined()
  expect(sharedStrings).toContain('سلام &amp; دنیا')
  expect(sharedStrings).toContain('&amp;')
  expect(sheet).toContain('سلام &amp; دنیا')
  expect(sheet).toContain('&amp;')
  // Inline strings should be normalized too (Arabic yeh -> Persian yeh).
  expect(sheet).not.toContain('سلام &amp; دنيا')

  await cleanup()
})
