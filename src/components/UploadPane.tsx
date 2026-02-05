import type { Phase } from "../lib/uiTypes";
import ErrorDisplay from "./ErrorDisplay";
import FileDropZone from "./FileDropZone";
import StatusCard from "./StatusCard";

interface UploadPaneProps {
  phase: Phase;
  busy: boolean;
  activeFileName?: string;
  activeFileSize?: string;
  hasDownload: boolean;
  error?: string | null;
  onFileSelected: (file: File) => void;
  onCancel: () => void;
  onDownloadAgain: () => void;
}

export default function UploadPane({
  phase,
  busy,
  activeFileName,
  activeFileSize,
  hasDownload,
  error,
  onFileSelected,
  onCancel,
  onDownloadAgain,
}: UploadPaneProps) {
  return (
    <>
      <FileDropZone
        onFileSelected={onFileSelected}
        disabled={busy}
        activeFileName={activeFileName}
        activeFileSize={activeFileSize}
      />
      <StatusCard
        phase={phase}
        busy={busy}
        hasDownload={hasDownload}
        onCancel={onCancel}
        onDownloadAgain={onDownloadAgain}
      />
      {error ? <ErrorDisplay message={error} /> : null}
    </>
  );
}
