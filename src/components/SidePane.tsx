import type { Phase } from "../lib/uiTypes";
import FeaturesCard from "./FeaturesCard";
import ProcessingStatus from "./ProcessingStatus";

interface SidePaneProps {
  phase: Phase;
  maxFileSizeMb: number;
}

export default function SidePane({ phase, maxFileSizeMb }: SidePaneProps) {
  return (
    <>
      <ProcessingStatus phase={phase} />
      <FeaturesCard maxFileSizeMb={maxFileSizeMb} />
    </>
  );
}
