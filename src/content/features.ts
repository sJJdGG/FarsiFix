import { Cpu, ShieldCheck, Sparkles } from "lucide-react";

export const FEATURES = [
  {
    title: "کاملاً آفلاین",
    description: "هیچ داده‌ای از مرورگر شما خارج نمی‌شود. پردازش ۱۰۰٪ محلی است.",
    icon: ShieldCheck,
  },
  {
    title: "سریع و سبک",
    description: "پردازش با Web Worker انجام می‌شود تا رابط کاربری روان بماند.",
    icon: Cpu,
  },
  {
    title: "حفظ فرمت‌ها",
    description: "فقط متن‌ها نرمال می‌شوند؛ فرمول‌ها و قالب‌بندی اکسل دست‌نخورده می‌مانند.",
    icon: Sparkles,
  },
];
