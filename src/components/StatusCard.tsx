import { ArrowDownToLine, X } from "lucide-react";
import { getPhaseLabel, getPhaseTone } from "../content/status";
import type { Phase } from "../lib/uiTypes";
import Card from "./Card";

interface StatusCardProps {
  phase: Phase;
  busy: boolean;
  hasDownload: boolean;
  onCancel: () => void;
  onDownloadAgain: () => void;
}

export default function StatusCard({
  phase,
  busy,
  hasDownload,
  onCancel,
  onDownloadAgain,
}: StatusCardProps) {
  const phaseTone = getPhaseTone(phase);
  const isProcessing = phaseTone === "processing";
  const isDone = phaseTone === "done";
  const variant = isDone ? "success" : phaseTone === "error" ? "error" : "default";

  const titleClassByTone = {
    done: "text-turq-700 dark:text-turq-300",
    error: "text-rose-700 dark:text-rose-300",
    processing: "text-ink-900 dark:text-stone-100",
    idle: "text-ink-900 dark:text-stone-100",
  } as const;

  const bodyClassByTone = {
    done: "text-turq-600 dark:text-turq-400",
    error: "text-rose-600 dark:text-rose-400",
    processing: "text-stone-600 dark:text-stone-400",
    idle: "text-stone-600 dark:text-stone-400",
  } as const;

  const indicatorClassByTone = {
    done: "bg-turq-500 text-white",
    error: "bg-rose-500 text-white",
    processing: "bg-gold-100 text-gold-600 dark:bg-gold-900/50 dark:text-gold-400",
    idle: "bg-stone-100 text-stone-400 dark:bg-ink-800 dark:text-ink-400",
  } as const;

  return (
    <Card variant={variant}>
      {/* Progress stripe for processing state */}
      {isProcessing && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gold-200 dark:bg-gold-800">
          <div
            className="progress-stripe h-full bg-gold-500 dark:bg-gold-400"
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* Success glow effect */}
      {isDone && (
        <div className="absolute inset-0 bg-gradient-to-br from-turq-400/10 via-transparent to-transparent" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`text-base font-bold ${titleClassByTone[phaseTone]}`}>وضعیت فایل</h3>
          <p className={`mt-1.5 text-sm ${bodyClassByTone[phaseTone]}`} aria-live="polite">
            {getPhaseLabel(phase)}
          </p>
        </div>

        {/* Status indicator */}
        <div
          className={`
          flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300
          ${indicatorClassByTone[phaseTone]}
        `}
        >
          {isDone ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>موفق</title>
              <polyline points="20 6 9 17 4 12" className="animate-check-draw" />
            </svg>
          ) : phaseTone === "error" ? (
            <X className="h-5 w-5" />
          ) : isProcessing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold-300 border-t-gold-600 dark:border-gold-700 dark:border-t-gold-400" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-stone-300 dark:bg-ink-600" />
          )}
        </div>
      </div>

      {/* Action buttons */}
      {(busy || hasDownload) && (
        <div className="relative mt-4 flex flex-wrap gap-3">
          {busy && (
            <button
              type="button"
              onClick={onCancel}
              className="
                inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 
                px-4 py-2 text-sm font-semibold text-rose-700 
                transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md
                focus-ring
                dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50
              "
            >
              <X className="h-4 w-4" />
              لغو پردازش
            </button>
          )}
          {hasDownload && (
            <button
              type="button"
              data-testid="download-again"
              onClick={onDownloadAgain}
              className="
                inline-flex items-center gap-2 rounded-full bg-turq-600 
                px-5 py-2 text-sm font-semibold text-white 
                shadow-lg shadow-turq-600/30 transition-all duration-300 
                hover:-translate-y-0.5 hover:bg-turq-500 hover:shadow-xl
                focus-ring
                dark:bg-turq-500 dark:shadow-turq-500/25 dark:hover:bg-turq-400
              "
            >
              <ArrowDownToLine className="h-4 w-4" />
              دانلود دوباره خروجی
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
