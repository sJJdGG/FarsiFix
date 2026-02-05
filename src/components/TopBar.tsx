import { Github } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  return (
    <nav className="flex items-center justify-between">
      {/* Logo mark */}
      <div className="flex items-center gap-3">
        <div
          className="
          flex h-10 w-10 items-center justify-center rounded-xl 
          bg-ink-900 text-white shadow-lg shadow-ink-900/30
          dark:bg-gold-500 dark:text-ink-950 dark:shadow-gold-500/30
        "
        >
          <span className="text-lg font-black">ف</span>
        </div>
        <span className="text-sm font-bold text-ink-800 dark:text-stone-200">
          فارسی‌فیکس
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/mmkholerdi/farsifix"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex h-10 w-10 items-center justify-center rounded-xl 
            border border-stone-200 bg-white/80 text-stone-600
            shadow-sm backdrop-blur-sm transition-all duration-300
            hover:-translate-y-0.5 hover:border-ink-300 hover:text-ink-900 hover:shadow-md
            focus-ring
            dark:border-ink-700 dark:bg-ink-800/80 dark:text-stone-400 
            dark:hover:border-ink-500 dark:hover:text-stone-200
          "
          aria-label="مشاهده در گیت‌هاب"
        >
          <Github className="h-5 w-5" />
        </a>
        <ThemeToggle />
      </div>
    </nav>
  );
}
