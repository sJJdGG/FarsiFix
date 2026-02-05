import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-50 text-ink-900 dark:bg-ink-950 dark:text-stone-100">
      {/* Layered gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark" />

      {/* Mesh gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-gradient dark:bg-mesh-gradient-dark opacity-80" />

      {/* Geometric pattern */}
      <div className="geo-pattern pointer-events-none absolute inset-0 opacity-40 dark:opacity-20" />

      {/* Top glow accent */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[600px] -translate-x-1/2 rounded-full bg-gold-400/20 blur-[100px] dark:bg-gold-500/10" />

      {/* Side accent glow */}
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-turq-400/15 blur-[80px] dark:bg-turq-500/10" />

      {/* Grain texture overlay */}
      <div className="grain-overlay pointer-events-none absolute inset-0" />

      <main className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12 sm:py-16">
        {children}
      </main>

      {/* Bottom decorative element */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent dark:via-ink-700" />
    </div>
  );
}
