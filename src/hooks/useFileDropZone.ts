import { useCallback, useId, useRef, useState } from "react";

interface UseFileDropZoneOptions {
  disabled: boolean;
  onFileSelected: (file: File) => void;
}

export const useFileDropZone = ({ disabled, onFileSelected }: UseFileDropZoneOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) {
        return;
      }
      setIsDragging(false);
      const [file] = Array.from(event.dataTransfer.files);
      if (file) {
        onFileSelected(file);
      }
    },
    [disabled, onFileSelected],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const [file] = Array.from(event.target.files ?? []);
      if (file) {
        onFileSelected(file);
      }
      event.target.value = "";
    },
    [onFileSelected],
  );

  return {
    isDragging,
    inputId,
    inputRef,
    openFileDialog,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
  };
};
