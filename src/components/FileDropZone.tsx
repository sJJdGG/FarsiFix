import { FileSpreadsheet, Upload } from "lucide-react";
import { useFileDropZone } from "../hooks/useFileDropZone";
import Card from "./Card";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  activeFileName?: string;
  activeFileSize?: string;
}

const ACCEPTED_TYPES = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx";

export default function FileDropZone({
  onFileSelected,
  disabled = false,
  activeFileName,
  activeFileSize,
}: FileDropZoneProps) {
  const {
    isDragging,
    inputId,
    inputRef,
    openFileDialog,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
  } = useFileDropZone({ disabled, onFileSelected });

  return (
    <Card
      as="button"
      variant="plain"
      type="button"
      className={`
        group relative flex min-h-[300px] flex-col items-center justify-center gap-5 
        rounded-2xl p-6 text-center transition-all duration-500 ease-out-expo sm:min-h-[340px] sm:p-8
        ${
          isDragging
            ? "border-2 border-gold-400 bg-gold-50/70 shadow-glow dark:border-gold-500 dark:bg-gold-900/20"
            : "border-2 border-dashed border-stone-300 bg-white/70 shadow-card hover:border-ink-300 hover:bg-white/80 dark:border-ink-700 dark:bg-ink-900/50 dark:shadow-card-dark dark:hover:border-ink-500 dark:hover:bg-ink-900/60"
        }
        ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
        backdrop-blur-none
      `}
      aria-busy={disabled}
      disabled={disabled}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={openFileDialog}
    >
      {/* Decorative corner accents */}
      <div
        className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-stone-200 transition-colors group-hover:border-gold-400 dark:border-ink-700 dark:group-hover:border-gold-500"
        style={{ borderTopRightRadius: "8px" }}
      />
      <div
        className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-stone-200 transition-colors group-hover:border-gold-400 dark:border-ink-700 dark:group-hover:border-gold-500"
        style={{ borderBottomLeftRadius: "8px" }}
      />

      {/* Upload icon */}
      <div
        className={`
        relative flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-500
        ${
          isDragging
            ? "scale-110 bg-gold-400 text-white shadow-lg"
            : "bg-ink-100 text-ink-600 group-hover:bg-ink-200 group-hover:scale-105 dark:bg-ink-800 dark:text-ink-300 dark:group-hover:bg-ink-700"
        }
      `}
      >
        <Upload
          className={`h-9 w-9 transition-transform duration-500 ${isDragging ? "-translate-y-1" : ""}`}
        />
        {isDragging && <div className="absolute inset-0 rounded-2xl bg-gold-400 opacity-30" />}
      </div>

      {/* Text content */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-ink-900 dark:text-stone-100">
          {isDragging ? "فایل را رها کنید" : "فایل اکسل را اینجا رها کنید"}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">یا کلیک کنید برای انتخاب فایل</p>
      </div>

      {/* CTA Button */}
      <span
        className="
          relative mt-2 inline-flex items-center gap-2.5 overflow-hidden rounded-full 
          bg-ink-900 px-7 py-3 text-sm font-semibold text-white 
          shadow-lg shadow-ink-900/25 transition-all duration-300 
          hover:-translate-y-0.5 hover:bg-ink-800 hover:shadow-xl hover:shadow-ink-900/30
          focus-ring
          dark:bg-gold-500 dark:text-ink-950 dark:shadow-gold-500/25 dark:hover:bg-gold-400
        "
      >
        <FileSpreadsheet className="h-4 w-4" />
        انتخاب فایل اکسل
      </span>

      {/* File format indicator */}
      <div className="mt-2 flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-xs text-stone-600 dark:bg-ink-800 dark:text-stone-400">
        <span className="h-1.5 w-1.5 rounded-full bg-turq-500" />
        فرمت مجاز: <span className="font-semibold text-ink-700 dark:text-stone-300">.xlsx</span>
      </div>

      {/* Selected file display */}
      {activeFileName && (
        <div
          className="
          absolute -bottom-4 left-1/2 -translate-x-1/2 transform
          flex items-center gap-3 rounded-2xl border border-turq-200 bg-turq-50 
          px-5 py-3 shadow-lg shadow-turq-500/10
          dark:border-turq-800 dark:bg-turq-900/50
        "
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-turq-500 text-white">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-ink-900 dark:text-stone-100">
              {activeFileName}
            </p>
            {activeFileSize && (
              <p className="text-xs text-turq-600 dark:text-turq-400">{activeFileSize}</p>
            )}
          </div>
          <div className="h-2 w-2 rounded-full bg-turq-500" />
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES}
        data-testid="file-input"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </Card>
  );
}
