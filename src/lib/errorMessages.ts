import {
  ERROR_CODES,
  type WorkerErrorPayload,
  isWorkerErrorPayload,
} from './workerContracts'

export const mapWorkerErrorMessage = (error: WorkerErrorPayload) => {
  if (error.code === ERROR_CODES.sharedStringsTooLarge) {
    return 'حجم محتوای متنی فایل بسیار زیاد است و امکان پردازش امن وجود ندارد.'
  }
  if (error.code === ERROR_CODES.sheetTooLarge) {
    return 'یکی از شیت‌ها بسیار بزرگ است (بیش از ۵۰ مگابایت متن XML).'
  }
  if (error.code === ERROR_CODES.aborted) {
    return 'پردازش لغو شد.'
  }
  if (error.code === ERROR_CODES.invalidZip) {
    return 'این فایل اکسل معتبر نیست یا آسیب دیده است.'
  }
  return error.message
}

export const mapUnknownErrorMessage = (error: unknown) => {
  if (isWorkerErrorPayload(error)) {
    return mapWorkerErrorMessage(error)
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'یک خطای ناشناخته رخ داد.'
}
