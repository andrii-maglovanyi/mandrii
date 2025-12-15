"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ImageCarouselProps {
  autoPlay?: boolean;
  autoPlayDelay?: number;
  images?: Array<string>;
  preloadNext?: boolean;
  showDots?: boolean;
  transitionDurationMs?: number;
  transitionEasing?: string;
}

export const ImageCarousel = ({
  autoPlay = false,
  autoPlayDelay = 8000,
  images = [],
  preloadNext = true,
  showDots = false,
  transitionDurationMs = 500,
  transitionEasing = "cubic-bezier(0.33, 1, 0.68, 1)",
}: ImageCarouselProps) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());

  const indexedImages = useMemo(() => images.map((src, originalIndex) => ({ originalIndex, src })), [images]);

  const validImages = useMemo(
    () => indexedImages.filter(({ originalIndex }) => !errorIndices.has(originalIndex)),
    [indexedImages, errorIndices],
  );

  const totalImages = validImages.length;
  const hasMultipleImages = totalImages > 1;

  const slides = useMemo(() => {
    if (totalImages === 0) return [];
    if (!hasMultipleImages) return validImages;

    const first = validImages[0];
    const last = validImages[validImages.length - 1];
    return [last, ...validImages, first];
  }, [hasMultipleImages, totalImages, validImages]);

  const initialSlideIndex = hasMultipleImages ? 1 : 0;

  const nextImage = useCallback(() => {
    if (!hasMultipleImages || slides.length === 0) return;
    setIsTransitionEnabled(true);
    setSlideIndex((prevIndex) => Math.min(prevIndex + 1, slides.length - 1));
  }, [hasMultipleImages, slides.length]);

  const prevImage = useCallback(() => {
    if (!hasMultipleImages || slides.length === 0) return;
    setIsTransitionEnabled(true);
    setSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, [hasMultipleImages, slides.length]);

  const goToImage = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= totalImages) return;
      setIsTransitionEnabled(true);
      setSlideIndex(hasMultipleImages ? targetIndex + 1 : targetIndex);
    },
    [hasMultipleImages, totalImages],
  );

  const handleImageError = useCallback((originalIndex: number) => {
    setErrorIndices((prev) => {
      const updated = new Set(prev);
      updated.add(originalIndex);
      return updated;
    });
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (!hasMultipleImages || slides.length === 0 || !isTransitionEnabled) return;

    const lastIndex = slides.length - 1;
    if (slideIndex === lastIndex || slideIndex === 0) {
      const targetIndex = slideIndex === lastIndex ? 1 : lastIndex - 1;
      setIsTransitionEnabled(false);
      requestAnimationFrame(() => {
        setSlideIndex(targetIndex);
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
        });
      });
    }
  }, [hasMultipleImages, isTransitionEnabled, slideIndex, slides.length]);

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
    setSlideIndex(initialSlideIndex);
    setIsTransitionEnabled(true);
  }, [images, initialSlideIndex]);

  useEffect(() => {
    if (totalImages === 0) {
      setSlideIndex(0);
      return;
    }

    setSlideIndex((current) => {
      if (!hasMultipleImages) return 0;

      const maxIndex = slides.length - 1;
      if (current === 0) return 1;
      if (current > maxIndex) return maxIndex - 1;
      return current;
    });
  }, [hasMultipleImages, slides.length, totalImages]);

  useEffect(() => {
    if (!autoPlay || !hasMultipleImages) return;

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      nextImage();
      intervalId = window.setInterval(() => {
        nextImage();
      }, autoPlayDelay);
    }, autoPlayDelay * 2);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [autoPlay, autoPlayDelay, hasMultipleImages, nextImage]);

  if (totalImages === 0) {
    return (
      <div
        className={`bg-surface-tint relative flex h-full w-full min-w-20 items-center justify-center overflow-hidden md:min-w-40`}
      >
        <Image alt="No image available" className="object-cover" fill src="/static/no-image.webp" />
      </div>
    );
  }

  const normalizedIndex = hasMultipleImages ? (slideIndex - 1 + totalImages) % totalImages : slideIndex;

  const nextImageSrc = preloadNext && totalImages > 0 ? validImages[(normalizedIndex + 1) % totalImages]?.src : null;

  return (
    <div
      aria-label={`Image ${normalizedIndex + 1} of ${totalImages}`}
      className={`bg-surface-tint relative flex h-full w-full min-w-20 items-center justify-center overflow-hidden md:min-w-40`}
      role="img"
    >
      <div className="h-full w-full overflow-hidden">
        <div
          className="flex h-full w-full will-change-transform"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(-${slideIndex * 100}%)`,
            transition: `transform ${isTransitionEnabled ? `${transitionDurationMs}ms` : "0ms"} ${transitionEasing}`,
          }}
        >
          {slides.map(({ originalIndex, src }, slidePosition) => {
            const realIndex = hasMultipleImages
              ? slidePosition === 0
                ? totalImages - 1
                : slidePosition === slides.length - 1
                  ? 0
                  : slidePosition - 1
              : slidePosition;

            return (
              <div className="relative h-full w-full shrink-0" key={`${src}-${originalIndex}-${slidePosition}`}>
                <Image
                  alt={`Image ${realIndex + 1} of ${totalImages}`}
                  className="mt-0 mb-0 object-cover"
                  fill
                  onError={() => {
                    handleImageError(originalIndex);
                  }}
                  priority={slideIndex === slidePosition}
                  src={src}
                />
              </div>
            );
          })}
        </div>
      </div>

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
            className={`bg-neutral/25 text-on-surface hover:bg-neutral/50 focus:bg-neutral/50 absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full transition-all duration-200 focus:ring-2 focus:ring-white/50 focus:outline-none`}
            onClick={() => {
              prevImage();
            }}
            type="button"
          >
            <ArrowLeft />
          </button>
          <button
            aria-label="Next image"
            className={`bg-neutral/25 text-on-surface hover:bg-neutral/50 focus:bg-neutral/50 absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full transition-all duration-200 focus:ring-2 focus:ring-white/50 focus:outline-none`}
            onClick={() => {
              nextImage();
            }}
            type="button"
          >
            <ArrowRight />
          </button>
          {showDots && (
            <div className={`absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 space-x-1`}>
              {validImages.map((_, dotIndex) => (
                <button
                  aria-label={`Go to image ${dotIndex + 1}`}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    dotIndex === normalizedIndex ? "bg-white" : `bg-white/50 hover:bg-white/75`
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
