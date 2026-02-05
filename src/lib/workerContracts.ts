import type { Phase } from "./uiTypes";

export const ERROR_CODES = {
  invalidZip: "FARSIFIX_INVALID_ZIP",
  sharedStringsTooLarge: "FARSIFIX_SHARED_STRINGS_TOO_LARGE",
  sheetTooLarge: "FARSIFIX_SHEET_TOO_LARGE",
  aborted: "FARSIFIX_ABORTED",
} as const;

export const UNKNOWN_ERROR_CODE = "FARSIFIX_UNKNOWN" as const;

export type WorkerErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type WorkerPhase = Extract<Phase, "parsing" | "normalizing" | "compressing">;
export type ProgressCallback = (phase: WorkerPhase) => void;

export class WorkerError extends Error {
  code: WorkerErrorCode;

  constructor(code: WorkerErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "WorkerError";
  }
}

export type WorkerErrorPayload = {
  code: WorkerErrorCode | typeof UNKNOWN_ERROR_CODE;
  message: string;
};

export type WorkerResult =
  | { ok: true; data: ArrayBuffer }
  | { ok: false; error: WorkerErrorPayload };

export type ExcelWorker = {
  processExcel: (
    buffer: ArrayBuffer,
    jobId: string,
    onProgress?: ProgressCallback,
  ) => Promise<WorkerResult>;
  cancel: (jobId: string) => Promise<void>;
};

export const isWorkerErrorPayload = (value: unknown): value is WorkerErrorPayload =>
  typeof value === "object" &&
  value !== null &&
  "code" in value &&
  "message" in value &&
  typeof (value as { code?: unknown }).code === "string" &&
  typeof (value as { message?: unknown }).message === "string";

export const toWorkerErrorPayload = (error: unknown): WorkerErrorPayload => {
  if (error instanceof WorkerError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: UNKNOWN_ERROR_CODE, message: error.message || "Unknown error" };
  }
  if (typeof error === "string") {
    return { code: UNKNOWN_ERROR_CODE, message: error };
  }
  return { code: UNKNOWN_ERROR_CODE, message: "Unknown error" };
};
