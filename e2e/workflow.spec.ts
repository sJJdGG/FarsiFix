import { expect, test } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const samplePath = path.resolve(__dirname, '../sample.xlsx')

test('uploads and downloads normalized excel', async ({ page }) => {
  await page.goto('/')

  const downloadPromise = page.waitForEvent('download')
  await page.setInputFiles('[data-testid="file-input"]', samplePath)
  const download = await downloadPromise

  await expect(download.suggestedFilename()).toBe('sample_FarsiFix.xlsx')
})
