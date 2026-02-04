import JSZip from 'jszip'
import { normalizeXmlText } from '../lib/xmlTextNormalizer'

export type WorkerPhase = 'parsing' | 'normalizing' | 'compressing'
export type ProgressCallback = (phase: WorkerPhase) => void

export const ERROR_CODES = {
  invalidZip: 'FARSIFIX_INVALID_ZIP',
  sharedStringsTooLarge: 'FARSIFIX_SHARED_STRINGS_TOO_LARGE',
  sheetTooLarge: 'FARSIFIX_SHEET_TOO_LARGE',
  aborted: 'FARSIFIX_ABORTED',
}

const MAX_SHEET_XML_BYTES = 50 * 1024 * 1024
const MAX_SHARED_STRINGS_BYTES = 200 * 1024 * 1024

const textEncoder = new TextEncoder()
const measureBytes = (value: string) => textEncoder.encode(value).length

const assertNotAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new Error(ERROR_CODES.aborted)
  }
}

export const processExcelBuffer = async (
  buffer: ArrayBuffer,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
) => {
  onProgress?.('parsing')
  assertNotAborted(signal)

  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(buffer)
  } catch (error) {
    console.error('[FarsiFix] Failed to read zip', error)
    throw new Error(ERROR_CODES.invalidZip)
  }

  assertNotAborted(signal)
  onProgress?.('normalizing')

  const sharedStrings = zip.file('xl/sharedStrings.xml')
  if (sharedStrings) {
    const xml = await sharedStrings.async('string')
    assertNotAborted(signal)
    // Guard against massive sharedStrings to avoid OOM.
    if (measureBytes(xml) > MAX_SHARED_STRINGS_BYTES) {
      throw new Error(ERROR_CODES.sharedStringsTooLarge)
    }
    const normalized = normalizeXmlText(xml)
    zip.file('xl/sharedStrings.xml', normalized)
  }

  const sheetNames = Object.keys(zip.files).filter((name) =>
    /^xl\/worksheets\/sheet\d+\.xml$/.test(name)
  )

  for (const sheetName of sheetNames) {
    assertNotAborted(signal)
    const sheetFile = zip.file(sheetName)
    if (!sheetFile) {
      continue
    }
    const xml = await sheetFile.async('string')
    assertNotAborted(signal)
    // Guard against pathological sheet XML sizes.
    if (measureBytes(xml) > MAX_SHEET_XML_BYTES) {
      throw new Error(ERROR_CODES.sheetTooLarge)
    }
    const normalized = normalizeXmlText(xml)
    zip.file(sheetName, normalized)
  }

  onProgress?.('compressing')
  assertNotAborted(signal)

  return zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
