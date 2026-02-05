import { AlertCircle } from "lucide-react";
import { FEATURES } from "../content/features";
import Card from "./Card";

interface FeaturesCardProps {
  maxFileSizeMb: number;
}

export default function FeaturesCard({ maxFileSizeMb }: FeaturesCardProps) {
  return (
    <Card>
      {/* Decorative gradient corner */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl dark:bg-gold-500/5" />

      <h3 className="relative text-base font-bold text-ink-900 dark:text-stone-100">
        چرا فارسی‌فیکس؟
      </h3>

      <div className="relative mt-4 flex flex-col gap-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="
                group relative flex items-start gap-3 rounded-xl border border-stone-100 
                bg-stone-50/50 p-4 transition-all duration-300
                hover:border-gold-200 hover:bg-gold-50/50 hover:shadow-md
                dark:border-ink-800 dark:bg-ink-800/30 
                dark:hover:border-gold-800 dark:hover:bg-gold-900/20
              "
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon container */}
              <span
                className="
                flex h-11 w-11 shrink-0 items-center justify-center rounded-xl 
                bg-ink-100 text-ink-600 transition-all duration-300
                group-hover:bg-gold-400 group-hover:text-white group-hover:shadow-lg group-hover:shadow-gold-400/30
                dark:bg-ink-700 dark:text-ink-300 
                dark:group-hover:bg-gold-500 dark:group-hover:text-ink-950
              "
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-ink-900 dark:text-stone-100">
                  {feature.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* File size limit notice */}
      <div
        className="
        relative mt-4 flex items-center gap-3 rounded-xl border border-rose-100 
        bg-rose-50/60 px-4 py-3
        dark:border-rose-900/50 dark:bg-rose-900/20
      "
      >
        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
        <p className="text-xs text-rose-700 dark:text-rose-300">
          حداکثر حجم مجاز: <span className="font-bold">{maxFileSizeMb} مگابایت</span>
        </p>
      </div>
    </Card>
  );
}
