"use client";

import { useCallback, useRef, useState } from "react";

import { compressImageForUpload } from "~/lib/images/compressImage";
import { isSupportedImageUploadSource } from "~/lib/images/uploadConfig";

/**
 * Shared browser-side image preparation for every user upload flow.
 * It validates source files and compresses them before a serverless request is made.
 */
export const useImageUploadPreparation = (maxBytes: number, onPreparingChange?: (isPreparing: boolean) => void) => {
  const [isPreparing, setIsPreparing] = useState(false);
  const pendingPreparations = useRef(0);

  const setPreparationState = useCallback(
    (change: 1 | -1) => {
      pendingPreparations.current = Math.max(0, pendingPreparations.current + change);
      const nextIsPreparing = pendingPreparations.current > 0;
      setIsPreparing(nextIsPreparing);
      onPreparingChange?.(nextIsPreparing);
    },
    [onPreparingChange],
  );

  const prepareImages = useCallback(
    async (files: Iterable<File>) => {
      const sourceImages = Array.from(files).filter(isSupportedImageUploadSource);
      if (!sourceImages.length) return [];

      setPreparationState(1);
      try {
        return await Promise.all(sourceImages.map((file) => compressImageForUpload(file, maxBytes)));
      } finally {
        setPreparationState(-1);
      }
    },
    [maxBytes, setPreparationState],
  );

  return { isPreparing, prepareImages };
};
