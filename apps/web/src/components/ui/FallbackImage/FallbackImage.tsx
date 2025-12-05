"use client";

import Image, { ImageProps } from "next/image";
import { useCallback, useState } from "react";

const FALLBACK_IMAGE = "/static/no-image.webp";

interface FallbackImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

/**
 * Image component with automatic fallback to a placeholder when the source fails to load.
 * Uses React state to handle the fallback, ensuring smooth transitions without flickering.
 */
export const FallbackImage = ({ fallbackSrc = FALLBACK_IMAGE, src, ...props }: FallbackImageProps) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);
  }, [fallbackSrc]);

  return <Image {...props} onError={handleError} src={imgSrc} />;
};
