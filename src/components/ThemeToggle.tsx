import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const LABELS = {
  light: "روشن",
  dark: "تیره",
  system: "سیستم",
} as const;

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export default function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={`تم: ${LABELS[theme]}`}
      className="
        group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full 
        border border-stone-200 bg-white/80 px-4 py-2 text-sm font-medium 
        text-ink-700 shadow-sm backdrop-blur-none transition-all duration-300
        hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md
        focus-ring
        dark:border-ink-700 dark:bg-ink-800/80 dark:text-stone-300 
        dark:hover:border-gold-600
      "
    >
      {/* Animated icon container */}
      <span
        className="
        relative flex h-5 w-5 items-center justify-center 
        text-stone-500 transition-all duration-300
        group-hover:text-gold-500 dark:text-stone-400 dark:group-hover:text-gold-400
      "
      >
        <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
      </span>

      <span className="relative">{LABELS[theme]}</span>

      {/* Hover highlight */}
      <span
        className="
        absolute inset-0 hidden -translate-x-full bg-gradient-to-r from-transparent via-gold-400/10 to-transparent
        transition-transform duration-500 group-hover:translate-x-full sm:block
      "
      />
    </button>
  );
}
