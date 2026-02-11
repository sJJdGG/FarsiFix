import { AlertTriangle, X } from "lucide-react";
import Card from "./Card";

interface ErrorDisplayProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <Card variant="error" className="transition-all duration-300">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent" />

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <span
          className="
          flex h-10 w-10 shrink-0 items-center justify-center rounded-xl 
          bg-rose-500 text-white shadow-md shadow-rose-500/30
        "
        >
          <AlertTriangle className="h-5 w-5" />
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">مشکلی پیش آمد</h4>
          <p
            data-testid="error-message"
            className="mt-1.5 text-sm leading-relaxed text-rose-700 dark:text-rose-300"
          >
            {message}
          </p>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="
              flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
              text-rose-500 transition-all duration-200
              hover:bg-rose-100 hover:text-rose-700
              focus-ring
              dark:text-rose-400 dark:hover:bg-rose-800/50 dark:hover:text-rose-200
            "
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
