import { Check, Circle, Loader2 } from "lucide-react";
import { getPhaseBadgeLabel } from "../content/status";
import type { Phase } from "../lib/uiTypes";

const STEPS: Array<{ id: Exclude<Phase, "idle" | "error">; label: string }> = [
  { id: "parsing", label: "باز کردن فایل اکسل" },
  { id: "normalizing", label: "یکسان‌سازی متن فارسی" },
  { id: "compressing", label: "بسته‌بندی خروجی" },
  { id: "done", label: "آماده دانلود" },
];

interface ProcessingStatusProps {
  phase: Phase;
}

export default function ProcessingStatus({ phase }: ProcessingStatusProps) {
  const order = [
    "idle",
    "parsing",
    "normalizing",
    "compressing",
    "done",
  ] as const;
  const activeIndex =
    phase === "idle" || phase === "error"
      ? -1
      : order.indexOf(phase as (typeof order)[number]);

  const isDone = phase === "done";
  const isError = phase === "error";

  return (
    <section
      className="
      relative overflow-hidden rounded-2xl border border-stone-200 bg-white/70 p-5
      shadow-card backdrop-blur-sm transition-all duration-500
      dark:border-ink-700 dark:bg-ink-900/50 dark:shadow-card-dark
    "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink-900 dark:text-stone-100">
          مراحل پردازش
        </h3>
        <span
          className={`
            rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300
            ${
              isDone
                ? "bg-turq-100 text-turq-700 dark:bg-turq-900/50 dark:text-turq-300"
                : isError
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                  : activeIndex >= 0
                    ? "bg-gold-100 text-gold-700 dark:bg-gold-900/50 dark:text-gold-300"
                    : "bg-stone-100 text-stone-600 dark:bg-ink-800 dark:text-stone-400"
            }
          `}
        >
          {getPhaseBadgeLabel(phase)}
        </span>
      </div>

      {/* Steps timeline */}
      <div className="mt-5 space-y-0">
        {STEPS.map((step, index) => {
          const isComplete =
            phase === "done" || (activeIndex !== -1 && activeIndex > index);
          const isActive = activeIndex === index;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Vertical line connector */}
              {!isLast && (
                <div
                  className={`
                    absolute right-[11px] top-7 h-8 w-0.5 transition-all duration-500
                    ${isComplete ? "bg-turq-400 dark:bg-turq-500" : "bg-stone-200 dark:bg-ink-700"}
                  `}
                />
              )}

              {/* Step indicator */}
              <div
                className={`
                relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full 
                transition-all duration-500
                ${
                  isComplete
                    ? "bg-turq-500 text-white shadow-sm shadow-turq-500/30"
                    : isActive
                      ? "bg-gold-500 text-white shadow-md shadow-gold-500/40"
                      : "border-2 border-stone-200 bg-white text-stone-400 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-500"
                }
              `}
              >
                {isComplete ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Circle className="h-2.5 w-2.5 fill-current" />
                )}
              </div>

              {/* Step label */}
              <div className="flex-1 pb-6">
                <span
                  className={`
                    text-sm font-medium transition-all duration-300
                    ${
                      isComplete
                        ? "text-turq-700 dark:text-turq-400"
                        : isActive
                          ? "text-ink-900 dark:text-stone-100"
                          : "text-stone-500 dark:text-stone-500"
                    }
                  `}
                >
                  {step.label}
                </span>
                {isActive && (
                  <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-gold-100 dark:bg-gold-900/30">
                    <div className="progress-stripe h-full w-full bg-gold-400 dark:bg-gold-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
