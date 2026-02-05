import { FEATURES } from '../content/features'

interface FeaturesCardProps {
  maxFileSizeMb: number
}

export default function FeaturesCard({ maxFileSizeMb }: FeaturesCardProps) {
  return (
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
                <h4 className="text-sm font-semibold text-sand-900">{feature.title}</h4>
                <p className="mt-1 text-sm text-sand-600">{feature.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-5 rounded-2xl border border-ember-200/60 bg-ember-50/70 px-4 py-3 text-xs text-ember-700">
        حداکثر حجم مجاز فایل: {maxFileSizeMb} مگابایت
      </div>
    </section>
  )
}
