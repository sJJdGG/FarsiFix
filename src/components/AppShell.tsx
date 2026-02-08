import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-50 text-ink-900 dark:bg-ink-950 dark:text-stone-100">
      {/* Layered gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark" />

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 sm:gap-16 sm:py-16">
        {children}
      </main>

      {/* Bottom decorative element */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent dark:via-ink-700" />
    </div>
  );
}
