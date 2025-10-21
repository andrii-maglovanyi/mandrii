import { useEffect, useState } from "react";

export interface ImageFile {
  file: File;
  url: string;
}

/**
 * Hook to manage image preview state.
 * Automatically creates and revokes object URLs.
 *
 * @param file - File to preview (or null/undefined)
 * @returns ImageFile with blob URL for preview, or null
 */
export function useImagePreview(file: File | null | undefined): ImageFile | null {
  const [preview, setPreview] = useState<ImageFile | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview({ file, url });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return preview;
}

/**
 * Hook to manage multiple image previews.
 * Automatically creates and revokes object URLs.
 *
 * @param files - Array of files to preview
 * @returns Array of ImageFile with blob URLs
 */
export function useImagePreviews(files: File[]): ImageFile[] {
  const [previews, setPreviews] = useState<ImageFile[]>([]);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [files]);

  return previews;
}
