import { ShieldCheck, Sparkles } from "lucide-react";

export default function HeroHeader() {
  return (
    <header className="flex flex-col items-center gap-6 text-center">
      {/* Animated badge */}
      <div className="animate-fade-in-up inline-flex items-center gap-2.5 rounded-full border border-turq-200 bg-turq-50/80 px-4 py-2 text-sm font-medium text-turq-700 shadow-sm backdrop-blur-sm dark:border-turq-800 dark:bg-turq-900/50 dark:text-turq-300">
        <ShieldCheck className="h-4 w-4" />
        <span>پردازش امن و کاملاً محلی</span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-turq-500" />
      </div>

      {/* Main title with dramatic typography */}
      <div className="animate-fade-in-up delay-100 relative">
        {/* Decorative sparkle */}
        <Sparkles className="absolute -top-3 -right-6 h-6 w-6 animate-float text-gold-400 opacity-80 sm:-right-10 sm:h-8 sm:w-8" />

        <h1 className="relative text-5xl font-black tracking-tight text-ink-900 sm:text-6xl md:text-7xl dark:text-stone-50">
          <span className="relative">
            فارسی‌
            <span
              className="absolute -bottom-2 left-0 right-0 h-3 bg-gold-400/30 dark:bg-gold-500/20"
              style={{ transform: "skewX(-12deg)" }}
            />
          </span>
          <span className="text-gradient-gold">فیکس</span>
        </h1>
      </div>

      {/* Subtitle with refined styling */}
      <p className="animate-fade-in-up delay-200 max-w-2xl text-lg leading-relaxed text-stone-600 sm:text-xl dark:text-stone-400">
        بهینه‌سازی فایل‌های اکسل برای جستجوی دقیق‌تر.
        <br className="hidden sm:block" />
        <span className="text-ink-700 dark:text-stone-300">متن‌های فارسی را یکسان کنید</span>، بدون
        دستکاری فرمول‌ها و قالب‌بندی‌ها.
      </p>

      {/* Decorative divider */}
      <div className="animate-fade-in-up delay-300 flex items-center gap-3 pt-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300 dark:to-ink-600" />
        <div className="h-2 w-2 rotate-45 border border-gold-400 bg-gold-100 dark:border-gold-600 dark:bg-gold-900/50" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300 dark:to-ink-600" />
      </div>
    </header>
  );
}
