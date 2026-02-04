import * as Comlink from 'comlink'
import JSZip from 'jszip'
import { normalizeText } from '../lib/persianNormalizer'

if (import.meta.env.DEV) {
  import('virtual:terminal')
    .then(({ default: terminal }) => {
      globalThis.console = terminal as unknown as Console
      console.log('[FarsiFix] Worker console redirected to terminal')
    })
    .catch(() => {})
}

type WorkerPhase = 'parsing' | 'normalizing' | 'compressing'

type ProgressCallback = (phase: WorkerPhase) => void

const MAX_SHEET_XML_BYTES = 50 * 1024 * 1024
const MAX_SHARED_STRINGS_BYTES = 200 * 1024 * 1024

const ERROR_CODES = {
  invalidZip: 'FARSIFIX_INVALID_ZIP',
  sharedStringsTooLarge: 'FARSIFIX_SHARED_STRINGS_TOO_LARGE',
  sheetTooLarge: 'FARSIFIX_SHEET_TOO_LARGE',
}

// Regex-only XML surgery: do not DOM-parse to avoid formatting loss.
const TEXT_TAG_REGEX = /(<t(?:\s+[^>]*)?>)(.*?)(<\/t>)/g

const textEncoder = new TextEncoder()

const measureBytes = (value: string) => textEncoder.encode(value).length

// Do not decode XML entities here; Excel expects them untouched.
const normalizeXmlText = (xml: string) =>
  xml.replace(TEXT_TAG_REGEX, (_match, openTag: string, text: string, closeTag: string) => {
    const normalized = normalizeText(text)
    return `${openTag}${normalized}${closeTag}`
  })

const processExcel = async (buffer: ArrayBuffer, onProgress?: ProgressCallback) => {
  onProgress?.('parsing')
  let zip: JSZip

  try {
    zip = await JSZip.loadAsync(buffer)
  } catch (error) {
    console.error('[FarsiFix] Failed to read zip', error)
    throw new Error(ERROR_CODES.invalidZip)
  }

  onProgress?.('normalizing')

  const sharedStrings = zip.file('xl/sharedStrings.xml')
  if (sharedStrings) {
    const xml = await sharedStrings.async('string')
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
    const sheetFile = zip.file(sheetName)
    if (!sheetFile) {
      continue
    }
    const xml = await sheetFile.async('string')
    // Guard against pathological sheet XML sizes.
    if (measureBytes(xml) > MAX_SHEET_XML_BYTES) {
      throw new Error(ERROR_CODES.sheetTooLarge)
    }
    const normalized = normalizeXmlText(xml)
    zip.file(sheetName, normalized)
  }

  onProgress?.('compressing')
  const output = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  // Transfer the underlying buffer back to the main thread (zero-copy).
  return Comlink.transfer(output, [output.buffer])
}

Comlink.expose({ processExcel })
