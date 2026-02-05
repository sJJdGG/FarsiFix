export type FileValidationError = "invalidType" | "tooLarge";

export type FileValidationResult = { ok: true } | { ok: false; reason: FileValidationError };

export const validateExcelFile = (file: File, maxBytes: number): FileValidationResult => {
  // Loose MIME check + strict extension check (browsers are inconsistent).
  const hasValidExtension = file.name.toLowerCase().endsWith(".xlsx");
  const mimeOk = !file.type || /(sheet|excel|octet-stream)/i.test(file.type);

  if (!hasValidExtension || !mimeOk) {
    return { ok: false, reason: "invalidType" };
  }

  if (file.size > maxBytes) {
    return { ok: false, reason: "tooLarge" };
  }

  return { ok: true };
};
