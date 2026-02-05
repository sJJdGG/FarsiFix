import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const LABELS = {
  light: 'روشن',
  dark: 'تیره',
  system: 'سیستم',
} as const

export default function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={`تم: ${LABELS[theme]}`}
      className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-sand-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-sand-700 dark:bg-sand-800/70 dark:text-sand-200"
    >
      {theme === 'system' ? (
        <Monitor className="h-4 w-4" />
      ) : theme === 'dark' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span>{LABELS[theme]}</span>
    </button>
  )
}
