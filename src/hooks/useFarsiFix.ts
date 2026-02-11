import { useCallback, useEffect, useMemo, useReducer } from "react";
import { isBusyPhase } from "../content/status";
import { triggerDownload } from "../lib/downloadUtils";
import { mapUnknownErrorMessage, mapWorkerErrorMessage } from "../lib/errorMessages";
import { formatBytes, getDownloadName } from "../lib/fileFormatting";
import type { Phase } from "../lib/uiTypes";
import { validateExcelFile } from "../lib/validateExcel";
import { useExcelWorker } from "./useExcelWorker";

type DownloadInfo = { url: string; name: string };
type FarsiFixState = {
  phase: Phase;
  error: string | null;
  activeFile: File | null;
  downloadInfo: DownloadInfo | null;
};

type FarsiFixAction =
  | { type: "fileSelected"; file: File }
  | { type: "setPhase"; phase: Phase }
  | { type: "setError"; message: string }
  | { type: "setDownload"; payload: DownloadInfo };

const initialState: FarsiFixState = {
  phase: "idle",
  error: null,
  activeFile: null,
  downloadInfo: null,
};

const farsifixReducer = (state: FarsiFixState, action: FarsiFixAction): FarsiFixState => {
  // Centralized transitions keep phase/error/download state consistent across async branches.
  if (action.type === "fileSelected") {
    return {
      ...state,
      phase: "idle",
      error: null,
      activeFile: action.file,
      downloadInfo: null,
    };
  }

  if (action.type === "setPhase") {
    return { ...state, phase: action.phase };
  }

  if (action.type === "setError") {
    return { ...state, phase: "error", error: action.message };
  }

  if (action.type === "setDownload") {
    return {
      ...state,
      phase: "done",
      error: null,
      downloadInfo: action.payload,
    };
  }

  return state;
};

export const useFarsiFix = () => {
  const { processBuffer, cancel, ready } = useExcelWorker();
  const [state, dispatch] = useReducer(farsifixReducer, initialState);

  const maxFileSizeMbRaw = Number.parseFloat(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? "100");
  const maxFileSizeMb = Number.isFinite(maxFileSizeMbRaw) ? maxFileSizeMbRaw : 100;
  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

  const busy = useMemo(() => isBusyPhase(state.phase), [state.phase]);
  const activeFileSize = useMemo(
    () => (state.activeFile ? formatBytes(state.activeFile.size) : undefined),
    [state.activeFile],
  );

  useEffect(() => {
    return () => {
      if (state.downloadInfo) {
        URL.revokeObjectURL(state.downloadInfo.url);
      }
    };
  }, [state.downloadInfo]);

  const handleDownload = useCallback((data: ArrayBuffer, originalName: string) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const name = getDownloadName(originalName);

    dispatch({ type: "setDownload", payload: { url, name } });
    triggerDownload(url, name);
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      if (busy) {
        return;
      }

      dispatch({ type: "fileSelected", file });

      const validation = validateExcelFile(file, maxFileSizeBytes);
      if (!validation.ok) {
        if (validation.reason === "invalidType") {
          dispatch({ type: "setError", message: "لطفاً یک فایل اکسل با پسوند .xlsx انتخاب کنید." });
        } else {
          dispatch({ type: "setError", message: `حجم فایل بیش از ${maxFileSizeMb} مگابایت است.` });
        }
        return;
      }

      try {
        dispatch({ type: "setPhase", phase: "parsing" });
        const buffer = await file.arrayBuffer();
        const result = await processBuffer(buffer, (nextPhase) =>
          // Worker progress is mapped 1:1 into reducer state updates.
          dispatch({ type: "setPhase", phase: nextPhase }),
        );
        if (!result.ok) {
          dispatch({ type: "setError", message: mapWorkerErrorMessage(result.error) });
          return;
        }
        handleDownload(result.data, file.name);
      } catch (err) {
        dispatch({ type: "setError", message: mapUnknownErrorMessage(err) });
        console.error(err);
      }
    },
    [busy, handleDownload, maxFileSizeBytes, maxFileSizeMb, processBuffer],
  );

  const handleDownloadAgain = useCallback(() => {
    if (!state.downloadInfo) {
      return;
    }
    triggerDownload(state.downloadInfo.url, state.downloadInfo.name);
  }, [state.downloadInfo]);

  return {
    phase: state.phase,
    busy,
    error: state.error,
    activeFile: state.activeFile,
    activeFileSize,
    downloadInfo: state.downloadInfo,
    workerReady: ready,
    maxFileSizeMb,
    handleFileSelected,
    handleCancel: cancel,
    handleDownloadAgain,
  };
};
