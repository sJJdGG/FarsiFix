import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { getPhaseBadgeLabel } from '../content/status'
import type { Phase } from '../lib/uiTypes'

const STEPS: Array<{ id: Exclude<Phase, 'idle' | 'error'>; label: string }> = [
  { id: 'parsing', label: 'باز کردن فایل اکسل' },
  { id: 'normalizing', label: 'یکسان‌سازی متن فارسی' },
  { id: 'compressing', label: 'بسته‌بندی خروجی' },
  { id: 'done', label: 'آماده دانلود' },
]

interface ProcessingStatusProps {
  phase: Phase
}

export default function ProcessingStatus({ phase }: ProcessingStatusProps) {
  const order = ['idle', 'parsing', 'normalizing', 'compressing', 'done'] as const
  const activeIndex =
    phase === 'idle' || phase === 'error' ? -1 : order.indexOf(phase as (typeof order)[number])

  return (
    <section className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-sand-900">وضعیت پردازش</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            phase === 'done'
              ? 'bg-jade-100 text-jade-700'
              : phase === 'error'
                ? 'bg-ember-100 text-ember-700'
                : 'bg-sand-100 text-sand-700'
          }`}
        >
          {getPhaseBadgeLabel(phase)}
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {STEPS.map((step, index) => {
          const isComplete = phase === 'done' || (activeIndex !== -1 && activeIndex > index)
          const isActive = activeIndex === index

          return (
            <div key={step.id} className="flex items-center gap-3 text-sm">
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-jade-500" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 animate-spin text-ember-500" />
              ) : (
                <Circle className="h-5 w-5 text-sand-300" />
              )}
              <span
                className={`${isComplete ? 'text-sand-900' : 'text-sand-600'} ${
                  isActive ? 'font-semibold text-sand-900' : ''
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
