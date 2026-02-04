import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { processExcelBuffer } from './excelCore'

const createWorkbook = async () => {
  const zip = new JSZip()
  zip.file(
    'xl/sharedStrings.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="1" uniqueCount="1">
  <si><t>سلام &amp; دنيا</t></si>
</sst>`
  )
  zip.file(
    'xl/worksheets/sheet1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>كريم</t></is></c>
    </row>
  </sheetData>
</worksheet>`
  )
  return zip.generateAsync({ type: 'arraybuffer' })
}

describe('processExcelBuffer', () => {
  it('normalizes sharedStrings and inline strings without breaking entities', async () => {
    const input = await createWorkbook()
    const output = await processExcelBuffer(input)

    const zip = await JSZip.loadAsync(output)
    const shared = await zip.file('xl/sharedStrings.xml')?.async('string')
    const sheet = await zip.file('xl/worksheets/sheet1.xml')?.async('string')

    expect(shared).toBeDefined()
    expect(sheet).toBeDefined()
    expect(shared).toContain('سلام &amp; دنیا')
    expect(shared).not.toContain('دنيا')
    expect(sheet).toContain('کریم')
    expect(sheet).not.toContain('كريم')
  })
})
