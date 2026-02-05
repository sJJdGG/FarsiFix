import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sand-50 text-sand-900 dark:bg-sand-900 dark:text-sand-50">
      <div className="pointer-events-none absolute inset-0 bg-hero-radial" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-[420px] -translate-x-1/2 rounded-full bg-ember-200/40 blur-[120px]" />

      <main className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14">
        {children}
      </main>
    </div>
  )
}
