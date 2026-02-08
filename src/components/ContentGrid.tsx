import type { ReactNode } from "react";

interface ContentGridProps {
  primary: ReactNode;
  secondary: ReactNode;
}

export default function ContentGrid({ primary, secondary }: ContentGridProps) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12">
      <section className="flex flex-col gap-8" aria-labelledby="upload-pane-heading">
        {primary}
      </section>
      <aside className="flex flex-col gap-6" aria-labelledby="insights-pane-heading">
        {secondary}
      </aside>
    </section>
  );
}
