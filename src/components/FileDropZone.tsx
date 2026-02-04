import { FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useId, useRef, useState } from 'react'

interface FileDropZoneProps {
  onFileSelected: (file: File) => void
  disabled?: boolean
  activeFileName?: string
  activeFileSize?: string
}

const ACCEPTED_TYPES =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx'

export default function FileDropZone({
  onFileSelected,
  disabled = false,
  activeFileName,
  activeFileSize,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleBrowse = () => {
    inputRef.current?.click()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) {
      return
    }
    setIsDragging(false)
    const [file] = Array.from(event.dataTransfer.files)
    if (file) {
      onFileSelected(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? [])
    if (file) {
      onFileSelected(file)
    }
    event.target.value = ''
  }

  return (
    <section
      className={`group relative flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed px-6 py-10 text-center transition-all duration-300 ${
        isDragging
          ? 'border-ember-400 bg-ember-50/50 shadow-glow'
          : 'border-sand-300 bg-white/70 backdrop-blur-sm'
      } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="absolute inset-3 rounded-[22px] border border-sand-200/70" />
      <div className="relative flex flex-col items-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-jade-100 text-jade-700 shadow-sm">
          <UploadCloud className="h-8 w-8" />
        </span>
        <div>
          <h3 className="text-xl font-semibold text-sand-900">فایل اکسل را رها کنید</h3>
          <p className="mt-2 text-sm text-sand-600">
            یا با یک کلیک انتخاب کنید. فایل شما هرگز از مرورگر خارج نمی‌شود.
          </p>
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-sand-900 px-6 py-2 text-sm font-semibold text-sand-50 shadow-lg shadow-sand-900/20 transition hover:-translate-y-0.5 hover:bg-sand-800"
          onClick={handleBrowse}
        >
          <FileSpreadsheet className="h-4 w-4" />
          انتخاب فایل اکسل
        </button>
      </div>
      <div className="relative mt-4 rounded-2xl border border-sand-200/60 bg-sand-50/70 px-4 py-3 text-sm text-sand-700">
        فرمت مجاز: <span className="font-semibold">.xlsx</span>
      </div>

      {activeFileName ? (
        <div className="relative mt-4 flex w-full max-w-sm flex-col gap-1 rounded-2xl border border-jade-200 bg-jade-50/60 px-4 py-3 text-start">
          <span className="text-xs text-jade-700">فایل انتخاب‌شده</span>
          <span className="text-sm font-semibold text-sand-900">{activeFileName}</span>
          {activeFileSize ? (
            <span className="text-xs text-sand-600">{activeFileSize}</span>
          ) : null}
        </div>
      ) : null}

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
    </section>
  )
}
