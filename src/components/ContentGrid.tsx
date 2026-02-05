import type { ReactNode } from "react";

interface ContentGridProps {
  primary: ReactNode;
  secondary: ReactNode;
}

export default function ContentGrid({ primary, secondary }: ContentGridProps) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12">
      <div className="flex flex-col gap-8 animate-fade-in-up">{primary}</div>
      <div className="flex flex-col gap-6 animate-fade-in-up delay-200">
        {secondary}
      </div>
    </section>
  );
}
