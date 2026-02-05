import { Download } from 'lucide-react'
import { getPhaseLabel } from '../content/status'
import type { Phase } from '../lib/uiTypes'

interface StatusCardProps {
  phase: Phase
  busy: boolean
  hasDownload: boolean
  onCancel: () => void
  onDownloadAgain: () => void
}

export default function StatusCard({
  phase,
  busy,
  hasDownload,
  onCancel,
  onDownloadAgain,
}: StatusCardProps) {
  return (
    <section className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-sand-900">وضعیت فایل</h3>
      <p className="mt-2 text-sm text-sand-600" aria-live="polite">
        {getPhaseLabel(phase)}
      </p>
      {busy ? (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-ember-200 bg-ember-50 px-5 py-2 text-sm font-semibold text-ember-700 transition hover:-translate-y-0.5 hover:bg-ember-100"
        >
          لغو پردازش
        </button>
      ) : null}
      {hasDownload ? (
        <button
          type="button"
          onClick={onDownloadAgain}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-jade-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-jade-600/30 transition hover:-translate-y-0.5 hover:bg-jade-500"
        >
          <Download className="h-4 w-4" />
          دانلود دوباره خروجی
        </button>
      ) : null}
    </section>
  )
}
