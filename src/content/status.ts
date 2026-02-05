import type { Phase } from '../lib/uiTypes'

export const STATUS_COPY: Record<Phase, string> = {
  idle: 'فایل اکسل خود را انتخاب کنید تا یکسان‌سازی شروع شود.',
  parsing: 'در حال باز کردن فایل اکسل…',
  normalizing: 'در حال یکسان‌سازی متن فارسی…',
  compressing: 'در حال آماده‌سازی خروجی…',
  done: 'خروجی آماده است. دانلود به صورت خودکار آغاز شد.',
  error: 'پردازش به مشکل خورد. لطفاً دوباره تلاش کنید.',
}

export const getPhaseLabel = (phase: Phase) => STATUS_COPY[phase]

export const PHASE_BADGE_LABELS: Record<Phase, string> = {
  idle: 'منتظر فایل شما',
  parsing: 'در حال خواندن فایل…',
  normalizing: 'در حال یکسان‌سازی متن…',
  compressing: 'در حال فشرده‌سازی خروجی…',
  done: 'پردازش کامل شد',
  error: 'خطا در پردازش',
}

export const getPhaseBadgeLabel = (phase: Phase) => PHASE_BADGE_LABELS[phase]
