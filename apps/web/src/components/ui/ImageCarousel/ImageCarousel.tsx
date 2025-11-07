"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ImageCarouselProps {
  images?: Array<string>;
  preloadNext?: boolean;
  showDots?: boolean;
}

export const ImageCarousel = ({ images = [], preloadNext = true, showDots = false }: ImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());

  const validImages = useMemo(() => images.filter((_, idx) => !errorIndices.has(idx)), [images, errorIndices]);

  const hasMultipleImages = validImages.length > 1;

  const nextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setIndex((prevIndex) => (prevIndex + 1) % validImages.length);
  }, [hasMultipleImages, validImages.length]);

  const prevImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setIndex((prevIndex) => (prevIndex - 1 + validImages.length) % validImages.length);
  }, [hasMultipleImages, validImages.length]);

  const goToImage = useCallback((targetIndex: number) => {
    setIndex(targetIndex);
  }, []);

  const handleImageError = useCallback(() => {
    setErrorIndices((prev) => new Set(prev).add(index));
  }, [index]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hasMultipleImages) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          prevImage();
          break;
        case "ArrowRight":
          event.preventDefault();
          nextImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, nextImage, prevImage]);

  useEffect(() => {
    setErrorIndices(new Set());
    setIndex(0);
  }, [images]);

  if (images.length === 0) {
    return (
      <div
        className={`bg-surface-tint relative flex h-full w-full min-w-20 items-center justify-center overflow-hidden md:min-w-40`}
      >
        <svg aria-hidden="true" className="h-full w-full" role="img">
          <use href="/assets/sprite.svg#no-image" />
        </svg>
      </div>
    );
  }

  const currentImageSrc = validImages[index] || images[0];
  const nextImageSrc = preloadNext && hasMultipleImages ? validImages[(index + 1) % validImages.length] : null;

  return (
    <div
      aria-label={`Image ${index + 1} of ${validImages.length}`}
      className={`bg-surface-tint relative flex h-full w-full min-w-20 items-center justify-center overflow-hidden md:min-w-40`}
      role="img"
    >
      <Image
        alt={`Image ${index + 1} of ${validImages.length}`}
        className="mt-0 mb-0 object-cover"
        fill
        onError={handleImageError}
        priority={index === 0}
        src={currentImageSrc}
      />

      {nextImageSrc && (
        <Image
          alt=""
          height={1}
          priority={false}
          src={nextImageSrc}
          style={{ opacity: 0, pointerEvents: "none", position: "absolute" }}
          width={1}
        />
      )}

      {hasMultipleImages && (
        <>
          <button
            aria-label="Previous image"
            className={`bg-neutral/25 text-on-surface hover:bg-neutral/50 focus:bg-neutral/50 absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full transition-all duration-200 focus:ring-2 focus:ring-white/50 focus:outline-none`}
            onClick={() => {
              prevImage();
            }}
            type="button"
          >
            <ArrowLeft />
          </button>

          <button
            aria-label="Next image"
            className={`bg-neutral/25 text-on-surface hover:bg-neutral/50 focus:bg-neutral/50 absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full transition-all duration-200 focus:ring-2 focus:ring-white/50 focus:outline-none`}
            onClick={() => {
              nextImage();
            }}
            type="button"
          >
            <ArrowRight />
          </button>

          {showDots && (
            <div className={`absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1`}>
              {validImages.map((_, dotIndex) => (
                <button
                  aria-label={`Go to image ${dotIndex + 1}`}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    dotIndex === index ? "bg-white" : `bg-white/50 hover:bg-white/75`
                  } `}
                  key={dotIndex}
                  onClick={() => {
                    goToImage(dotIndex);
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
