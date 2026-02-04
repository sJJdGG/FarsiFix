import { AlertTriangle } from 'lucide-react'

interface ErrorDisplayProps {
  message: string
}

export default function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <section className="rounded-3xl border border-ember-200 bg-ember-50/80 p-5 text-ember-900 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-ember-100 text-ember-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <h4 className="text-sm font-semibold">مشکلی پیش آمد</h4>
          <p className="mt-1 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </section>
  )
}
