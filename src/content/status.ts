import type { Phase } from "../lib/uiTypes";

const BUSY_PHASES = ["parsing", "normalizing", "compressing"] as const;
export const PROCESSING_PHASES = ["parsing", "normalizing", "compressing", "done"] as const;

type BusyPhase = (typeof BUSY_PHASES)[number];
export type ProcessingPhase = (typeof PROCESSING_PHASES)[number];
export type PhaseTone = "idle" | "processing" | "done" | "error";

type PhaseMeta = {
  label: string;
  badge: string;
  stepLabel?: string;
  busy?: boolean;
};

const PROCESSING_STEP_LABELS: Record<ProcessingPhase, string> = {
  parsing: "باز کردن فایل اکسل",
  normalizing: "یکسان‌سازی متن فارسی",
  compressing: "بسته‌بندی خروجی",
  done: "آماده دانلود",
};

export const PHASE_META: Record<Phase, PhaseMeta> = {
  idle: {
    label: "فایل اکسل خود را انتخاب کنید تا یکسان‌سازی شروع شود.",
    badge: "منتظر فایل شما",
  },
  parsing: {
    label: "در حال باز کردن فایل اکسل…",
    badge: "در حال خواندن فایل…",
    stepLabel: PROCESSING_STEP_LABELS.parsing,
    busy: true,
  },
  normalizing: {
    label: "در حال یکسان‌سازی متن فارسی…",
    badge: "در حال یکسان‌سازی متن…",
    stepLabel: PROCESSING_STEP_LABELS.normalizing,
    busy: true,
  },
  compressing: {
    label: "در حال آماده‌سازی خروجی…",
    badge: "در حال فشرده‌سازی خروجی…",
    stepLabel: PROCESSING_STEP_LABELS.compressing,
    busy: true,
  },
  done: {
    label: "خروجی آماده است. دانلود به صورت خودکار آغاز شد.",
    badge: "پردازش کامل شد",
    stepLabel: PROCESSING_STEP_LABELS.done,
  },
  error: {
    label: "پردازش به مشکل خورد. لطفاً دوباره تلاش کنید.",
    badge: "خطا در پردازش",
  },
};

export const getPhaseLabel = (phase: Phase) => PHASE_META[phase].label;
export const getPhaseBadgeLabel = (phase: Phase) => PHASE_META[phase].badge;
export const isBusyPhase = (phase: Phase) => BUSY_PHASES.includes(phase as BusyPhase);
export const getPhaseTone = (phase: Phase): PhaseTone => {
  if (phase === "done") {
    return "done";
  }
  if (phase === "error") {
    return "error";
  }
  return isBusyPhase(phase) ? "processing" : "idle";
};

export const PROCESSING_STEPS: Array<{ id: ProcessingPhase; label: string }> =
  PROCESSING_PHASES.map((phase) => ({
    id: phase,
    label: PROCESSING_STEP_LABELS[phase],
  }));
