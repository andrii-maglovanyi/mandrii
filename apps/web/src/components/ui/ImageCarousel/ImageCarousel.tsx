"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ImageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  images?: Array<string>;
  preloadNext?: boolean;
  showDots?: boolean;
}

export const ImageCarousel = ({
  autoPlay = false,
  autoPlayInterval = 5000,
  images = [],
  preloadNext = true,
  showDots = false,
}: ImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Memoize valid images (filter out errored ones)
  const validImages = useMemo(() => images.filter((_, idx) => !errorIndices.has(idx)), [images, errorIndices]);

  const hasMultipleImages = validImages.length > 1;

  // Optimized navigation functions with useCallback
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

  // Handle image errors more efficiently
  const handleImageError = useCallback(() => {
    setErrorIndices((prev) => new Set(prev).add(index));
  }, [index]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || !hasMultipleImages || isUserInteracting) return;

    const interval = setInterval(nextImage, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, hasMultipleImages, isUserInteracting, nextImage, autoPlayInterval]);

  // Keyboard navigation
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

  // Reset error state when images change
  useEffect(() => {
    setErrorIndices(new Set());
    setIndex(0);
  }, [images]);

  // User interaction handlers
  const handleUserInteraction = useCallback(() => {
    setIsUserInteracting(true);
    // Reset auto-play after a delay
    const timer = setTimeout(() => setIsUserInteracting(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (images.length === 0) {
    return (
      <div className={`
        relative flex h-full w-full min-w-20 items-center justify-center
        overflow-hidden bg-surface-tint
        md:min-w-40
      `}>
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
      className={`
        relative flex h-full w-full min-w-20 items-center justify-center
        overflow-hidden bg-surface-tint
        md:min-w-40
      `}
      role="img"
    >
      <Image
        alt={`Image ${index + 1} of ${validImages.length}`}
        className="mt-0 mb-0 object-cover"
        fill
        onError={handleImageError}
        priority={index === 0}
        sizes="(min-width: 1024px) 1024px, (min-width: 768px) 100vw, 250px"
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
            className={`
              absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 transform
              items-center justify-center rounded-full bg-neutral/25
              text-on-surface transition-all duration-200
              hover:bg-neutral/50
              focus:bg-neutral/50 focus:ring-2 focus:ring-white/50
              focus:outline-none
            `}
            onClick={() => {
              handleUserInteraction();
              prevImage();
            }}
            type="button"
          >
            <ArrowLeft />
          </button>

          <button
            aria-label="Next image"
            className={`
              absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 transform
              items-center justify-center rounded-full bg-neutral/25
              text-on-surface transition-all duration-200
              hover:bg-neutral/50
              focus:bg-neutral/50 focus:ring-2 focus:ring-white/50
              focus:outline-none
            `}
            onClick={() => {
              handleUserInteraction();
              nextImage();
            }}
            type="button"
          >
            <ArrowRight />
          </button>

          {showDots && (
            <div className={`
              absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1
            `}>
              {validImages.map((_, dotIndex) => (
                <button
                  aria-label={`Go to image ${dotIndex + 1}`}
                  className={`
                    h-2 w-2 rounded-full transition-all duration-200
                    ${
                    dotIndex === index ? "bg-white" : `
                      bg-white/50
                      hover:bg-white/75
                    `
                  }
                  `}
                  key={dotIndex}
                  onClick={() => {
                    handleUserInteraction();
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
