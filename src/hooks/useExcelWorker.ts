import * as Comlink from "comlink";
import { useCallback, useEffect, useRef } from "react";
import {
  type ExcelWorker,
  toWorkerErrorPayload,
  UNKNOWN_ERROR_CODE,
  type WorkerPhase,
  type WorkerResult,
} from "../lib/workerContracts";

export const useExcelWorker = () => {
  const workerRef = useRef<Comlink.Remote<ExcelWorker> | null>(null);
  const jobIdRef = useRef<string | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/excel.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = Comlink.wrap<ExcelWorker>(worker);

    return () => {
      worker.terminate();
    };
  }, []);

  const processBuffer = useCallback(
    async (
      buffer: ArrayBuffer,
      onProgress?: (phase: WorkerPhase) => void,
    ): Promise<WorkerResult> => {
      const worker = workerRef.current;
      if (!worker) {
        return {
          ok: false,
          error: { code: UNKNOWN_ERROR_CODE, message: "Worker not ready." },
        };
      }

      const jobId = crypto.randomUUID();
      jobIdRef.current = jobId;
      // Comlink proxy allows the worker to call back into the main thread.
      const progressProxy = onProgress ? Comlink.proxy(onProgress) : undefined;

      try {
        // Transfer the buffer so it is not cloned on the worker boundary.
        return await worker.processExcel(Comlink.transfer(buffer, [buffer]), jobId, progressProxy);
      } catch (error) {
        return { ok: false, error: toWorkerErrorPayload(error) };
      } finally {
        jobIdRef.current = null;
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    const worker = workerRef.current;
    const jobId = jobIdRef.current;
    if (worker && jobId) {
      void worker.cancel(jobId);
    }
  }, []);

  return { processBuffer, cancel };
};
