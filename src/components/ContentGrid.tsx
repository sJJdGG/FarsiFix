import type { ReactNode } from 'react'

interface ContentGridProps {
  primary: ReactNode
  secondary: ReactNode
}

export default function ContentGrid({ primary, secondary }: ContentGridProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex flex-col gap-6">{primary}</div>
      <div className="flex flex-col gap-6">{secondary}</div>
    </section>
  )
}
