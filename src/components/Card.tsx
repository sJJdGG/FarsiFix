import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardVariant = "default" | "success" | "error" | "plain";

const BASE_CLASSES =
  "relative overflow-hidden rounded-2xl border p-5 shadow-card backdrop-blur-none transition-all duration-500 dark:shadow-card-dark";

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: "border-stone-200 bg-white/70 dark:border-ink-700 dark:bg-ink-900/50",
  success: "border-turq-200 bg-turq-50/80 dark:border-turq-800 dark:bg-turq-900/30",
  error: "border-rose-200 bg-rose-50/80 dark:border-rose-800 dark:bg-rose-900/30",
  plain: "",
};

type CardProps<T extends ElementType> = {
  as?: T;
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export default function Card<T extends ElementType = "section">({
  as,
  variant = "default",
  className,
  children,
  ...props
}: CardProps<T>) {
  const Component = as ?? "section";
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
