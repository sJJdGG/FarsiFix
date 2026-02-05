import { ShieldCheck } from 'lucide-react'

export default function HeroHeader() {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/80 px-4 py-2 text-xs font-semibold text-sand-700 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-jade-600" />
        پردازش امن و کاملاً محلی
      </div>
      <h1 className="text-4xl font-black text-sand-900 sm:text-5xl">فارسی‌فیکس</h1>
      <p className="max-w-2xl text-base text-sand-700 sm:text-lg">
        بهینه‌سازی فایل‌های اکسل برای جستجوی بهتر. متن‌های فارسی را یکسان کنید، بدون
        دستکاری فرمول‌ها و قالب‌بندی‌ها.
      </p>
    </header>
  )
}
