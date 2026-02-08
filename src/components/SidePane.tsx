import type { Phase } from "../lib/uiTypes";
import FeaturesCard from "./FeaturesCard";
import ProcessingStatus from "./ProcessingStatus";

interface SidePaneProps {
  phase: Phase;
  maxFileSizeMb: number;
}

export default function SidePane({ phase, maxFileSizeMb }: SidePaneProps) {
  return (
    <section className="flex flex-col gap-6">
      <h2 id="insights-pane-heading" className="sr-only">
        اطلاعات پردازش و امکانات
      </h2>
      <ProcessingStatus phase={phase} />
      <FeaturesCard maxFileSizeMb={maxFileSizeMb} />
    </section>
  );
}
