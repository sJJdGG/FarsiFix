import { useCallback, useEffect, useMemo, useState } from "react";
import { isBusyPhase } from "../content/status";
import { triggerDownload } from "../lib/downloadUtils";
import { mapUnknownErrorMessage, mapWorkerErrorMessage } from "../lib/errorMessages";
import { formatBytes, getDownloadName } from "../lib/fileFormatting";
import type { Phase } from "../lib/uiTypes";
import { validateExcelFile } from "../lib/validateExcel";
import { useExcelWorker } from "./useExcelWorker";

type DownloadInfo = { url: string; name: string };

export const useFarsiFix = () => {
  const { processBuffer, cancel } = useExcelWorker();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);

  const maxFileSizeMbRaw = Number.parseFloat(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? "100");
  const maxFileSizeMb = Number.isFinite(maxFileSizeMbRaw) ? maxFileSizeMbRaw : 100;
  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

  const busy = useMemo(() => isBusyPhase(phase), [phase]);
  const activeFileSize = useMemo(
    () => (activeFile ? formatBytes(activeFile.size) : undefined),
    [activeFile],
  );

  useEffect(() => {
    return () => {
      if (downloadInfo) {
        URL.revokeObjectURL(downloadInfo.url);
      }
    };
  }, [downloadInfo]);

  const handleDownload = useCallback((data: ArrayBuffer, originalName: string) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const name = getDownloadName(originalName);

    setDownloadInfo({ url, name });
    triggerDownload(url, name);
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      if (busy) {
        return;
      }

      setError(null);
      setActiveFile(file);
      setDownloadInfo(null);

      const validation = validateExcelFile(file, maxFileSizeBytes);
      if (!validation.ok) {
        setPhase("error");
        if (validation.reason === "invalidType") {
          setError("لطفاً یک فایل اکسل با پسوند .xlsx انتخاب کنید.");
        } else {
          setError(`حجم فایل بیش از ${maxFileSizeMb} مگابایت است.`);
        }
        return;
      }

      try {
        setPhase("parsing");
        const buffer = await file.arrayBuffer();
        const result = await processBuffer(buffer, (nextPhase) => setPhase(nextPhase));
        if (!result.ok) {
          setPhase("error");
          setError(mapWorkerErrorMessage(result.error));
          return;
        }
        setPhase("done");
        handleDownload(result.data, file.name);
      } catch (err) {
        setPhase("error");
        setError(mapUnknownErrorMessage(err));
        console.error(err);
      }
    },
    [busy, handleDownload, maxFileSizeBytes, maxFileSizeMb, processBuffer],
  );

  const handleDownloadAgain = useCallback(() => {
    if (!downloadInfo) {
      return;
    }
    triggerDownload(downloadInfo.url, downloadInfo.name);
  }, [downloadInfo]);

  return {
    phase,
    busy,
    error,
    activeFile,
    activeFileSize,
    downloadInfo,
    maxFileSizeMb,
    handleFileSelected,
    handleCancel: cancel,
    handleDownloadAgain,
  };
};
