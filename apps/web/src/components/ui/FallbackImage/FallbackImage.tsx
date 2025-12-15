"use client";

import Image, { ImageProps } from "next/image";
import { useCallback, useState } from "react";

const FALLBACK_IMAGE = "/static/no-image.webp";

interface FallbackImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export const FallbackImage = ({ fallbackSrc = FALLBACK_IMAGE, src, ...props }: FallbackImageProps) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  const handleError = useCallback(() => {
    setImgSrc(fallbackSrc);
  }, [fallbackSrc]);

  return <Image {...props} alt="No image" onError={handleError} src={imgSrc} />;
};
