import * as Comlink from 'comlink'
import { ERROR_CODES, processExcelBuffer, type ProgressCallback } from './excelCore'

if (import.meta.env.DEV) {
  import('virtual:terminal')
    .then(({ default: terminal }) => {
      globalThis.console = terminal as unknown as Console
      console.log('[FarsiFix] Worker console redirected to terminal')
    })
    .catch(() => {})
}

const abortControllers = new Map<string, AbortController>()

const processExcel = async (
  buffer: ArrayBuffer,
  jobId: string,
  onProgress?: ProgressCallback
) => {
  const controller = new AbortController()
  abortControllers.set(jobId, controller)

  try {
    const output = await processExcelBuffer(buffer, onProgress, controller.signal)
    // Transfer the ArrayBuffer back to the main thread (zero-copy).
    return Comlink.transfer(output, [output])
  } finally {
    abortControllers.delete(jobId)
  }
}

const cancel = (jobId: string) => {
  abortControllers.get(jobId)?.abort()
}

Comlink.expose({ processExcel, cancel, ERROR_CODES })
