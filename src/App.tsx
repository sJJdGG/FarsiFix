import { Cpu, Download, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Comlink from 'comlink'
import ErrorDisplay from './components/ErrorDisplay'
import FileDropZone from './components/FileDropZone'
import ProcessingStatus from './components/ProcessingStatus'

type Phase = 'idle' | 'parsing' | 'normalizing' | 'compressing' | 'done' | 'error'

type WorkerPhase = 'parsing' | 'normalizing' | 'compressing'

interface ExcelWorker {
  processExcel: (
    buffer: ArrayBuffer,
    onProgress?: (phase: WorkerPhase) => void
  ) => Promise<Uint8Array>
}

const ERROR_CODES = {
  invalidZip: 'FARSIFIX_INVALID_ZIP',
  sharedStringsTooLarge: 'FARSIFIX_SHARED_STRINGS_TOO_LARGE',
  sheetTooLarge: 'FARSIFIX_SHEET_TOO_LARGE',
}

const STATUS_COPY: Record<Phase, string> = {
  idle: 'فایل اکسل خود را انتخاب کنید تا یکسان‌سازی شروع شود.',
  parsing: 'در حال باز کردن فایل اکسل…',
  normalizing: 'در حال یکسان‌سازی متن فارسی…',
  compressing: 'در حال آماده‌سازی خروجی…',
  done: 'خروجی آماده است. دانلود به صورت خودکار آغاز شد.',
  error: 'پردازش به مشکل خورد. لطفاً دوباره تلاش کنید.',
}

const FEATURES = [
  {
    title: 'کاملاً آفلاین',
    description: 'هیچ داده‌ای از مرورگر شما خارج نمی‌شود. پردازش ۱۰۰٪ محلی است.',
    icon: ShieldCheck,
  },
  {
    title: 'سریع و سبک',
    description: 'پردازش با Web Worker انجام می‌شود تا رابط کاربری روان بماند.',
    icon: Cpu,
  },
  {
    title: 'حفظ فرمت‌ها',
    description: 'فقط متن‌ها نرمال می‌شوند؛ فرمول‌ها و قالب‌بندی اکسل دست‌نخورده می‌مانند.',
    icon: Sparkles,
  },
]

const formatBytes = (bytes: number) => {
  if (bytes === 0) {
    return '۰ بایت'
  }
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`
}

const getDownloadName = (original: string) => {
  const lower = original.toLowerCase()
  if (lower.endsWith('.xlsx')) {
    return `${original.slice(0, -5)}_FarsiFix.xlsx`
  }
  return `${original}_FarsiFix.xlsx`
}

const mapErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const message = error.message
    if (message.includes(ERROR_CODES.sharedStringsTooLarge)) {
      return 'حجم محتوای متنی فایل بسیار زیاد است و امکان پردازش امن وجود ندارد.'
    }
    if (message.includes(ERROR_CODES.sheetTooLarge)) {
      return 'یکی از شیت‌ها بسیار بزرگ است (بیش از ۵۰ مگابایت متن XML).'
    }
    if (message.includes(ERROR_CODES.invalidZip)) {
      return 'این فایل اکسل معتبر نیست یا آسیب دیده است.'
    }
    return message
  }
  return 'یک خطای ناشناخته رخ داد.'
}

export default function App() {
  const workerRef = useRef<Comlink.Remote<ExcelWorker> | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [activeFile, setActiveFile] = useState<File | null>(null)
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; name: string } | null>(null)

  const maxFileSizeMbRaw = Number.parseFloat(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? '100')
  const maxFileSizeMb = Number.isFinite(maxFileSizeMbRaw) ? maxFileSizeMbRaw : 100
  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024

  const busy = ['parsing', 'normalizing', 'compressing'].includes(phase)

  useEffect(() => {
    const worker = new Worker(new URL('./workers/excel.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = Comlink.wrap<ExcelWorker>(worker)

    return () => {
      worker.terminate()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (downloadInfo) {
        URL.revokeObjectURL(downloadInfo.url)
      }
    }
  }, [downloadInfo])

  // Comlink callback to keep UI phase in sync with worker progress.
  const progressProxy = useMemo(
    () =>
      Comlink.proxy((nextPhase: WorkerPhase) => {
        setPhase(nextPhase)
      }),
    []
  )

  const handleDownload = (data: Uint8Array, originalName: string) => {
    // Ensure we use a standalone ArrayBuffer for Blob creation.
    const buffer = (data.buffer as ArrayBuffer).slice(
      data.byteOffset,
      data.byteOffset + data.byteLength
    )
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const name = getDownloadName(originalName)

    if (downloadInfo) {
      URL.revokeObjectURL(downloadInfo.url)
    }

    setDownloadInfo({ url, name })

    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleFileSelected = async (file: File) => {
    if (busy) {
      return
    }

    setError(null)
    setActiveFile(file)
    setDownloadInfo(null)

    // Loose MIME check + strict extension check (browsers are inconsistent).
    const hasValidExtension = file.name.toLowerCase().endsWith('.xlsx')
    const mimeOk = !file.type || /(sheet|excel|octet-stream)/i.test(file.type)

    if (!hasValidExtension || !mimeOk) {
      setPhase('error')
      setError('لطفاً یک فایل اکسل با پسوند .xlsx انتخاب کنید.')
      return
    }

    if (file.size > maxFileSizeBytes) {
      setPhase('error')
      setError(`حجم فایل بیش از ${maxFileSizeMb} مگابایت است.`)
      return
    }

    const worker = workerRef.current
    if (!worker) {
      setPhase('error')
      setError('پردازشگر آماده نیست. لطفاً چند لحظه دیگر تلاش کنید.')
      return
    }

    try {
      setPhase('parsing')
      const buffer = await file.arrayBuffer()
      // Transfer the ArrayBuffer to the worker (zero-copy).
      const output = await worker.processExcel(
        Comlink.transfer(buffer, [buffer]),
        progressProxy
      )
      setPhase('done')
      handleDownload(output, file.name)
    } catch (err) {
      setPhase('error')
      setError(mapErrorMessage(err))
      console.error(err)
    }
  }

  const handleDownloadAgain = () => {
    if (!downloadInfo) {
      return
    }
    const link = document.createElement('a')
    link.href = downloadInfo.url
    link.download = downloadInfo.name
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-sand-50 text-sand-900">
      <div className="pointer-events-none absolute inset-0 bg-hero-radial" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-[420px] -translate-x-1/2 rounded-full bg-ember-200/40 blur-[120px]" />

      <main className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/80 px-4 py-2 text-xs font-semibold text-sand-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-jade-600" />
            پردازش امن و کاملاً محلی
          </div>
          <h1 className="text-4xl font-black text-sand-900 sm:text-5xl">فارسی‌فیکس</h1>
          <p className="max-w-2xl text-base text-sand-700 sm:text-lg">
            بهینه‌سازی فایل‌های اکسل برای جستجوی بهتر. متن‌های فارسی را یکسان کنید، بدون
            دستکاری فرمول‌ها و قالب‌بندی‌ها.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-6">
            <FileDropZone
              onFileSelected={handleFileSelected}
              disabled={busy}
              activeFileName={activeFile?.name}
              activeFileSize={activeFile ? formatBytes(activeFile.size) : undefined}
            />
            <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-sand-900">وضعیت فایل</h3>
              <p className="mt-2 text-sm text-sand-600">{STATUS_COPY[phase]}</p>
              {downloadInfo ? (
                <button
                  type="button"
                  onClick={handleDownloadAgain}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-jade-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-jade-600/30 transition hover:-translate-y-0.5 hover:bg-jade-500"
                >
                  <Download className="h-4 w-4" />
                  دانلود دوباره خروجی
                </button>
              ) : null}
            </div>
            {error ? <ErrorDisplay message={error} /> : null}
          </div>

          <div className="flex flex-col gap-6">
            <ProcessingStatus phase={phase} />
            <section className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-sand-900">چرا فارسی‌فیکس؟</h3>
              <div className="mt-4 flex flex-col gap-4">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3 rounded-2xl border border-sand-100 bg-sand-50/70 p-4"
                    >
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-jade-100 text-jade-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-sand-900">
                          {feature.title}
                        </h4>
                        <p className="mt-1 text-sm text-sand-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-5 rounded-2xl border border-ember-200/60 bg-ember-50/70 px-4 py-3 text-xs text-ember-700">
                حداکثر حجم مجاز فایل: {maxFileSizeMb} مگابایت
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}
