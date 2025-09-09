"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageCarouselProps {
  images?: Array<string>;
}

export const ImageCarousel = ({ images = [] }: ImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(false);

  const nextImage = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
    setError(false);
  };

  const prevImage = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setError(false);
  };

  useEffect(() => {
    setError(false);
  }, [index]);

  return (
    <div
      className={`
        relative flex h-full w-full min-w-20 items-center justify-center
        overflow-hidden bg-surface-tint
        md:min-w-40
      `}
    >
      {!error ? (
        <Image
          alt={`Image ${index + 1}`}
          className="object-cover"
          fill
          onError={() => setError(true)}
          sizes="(min-width: 1024px) 350px, 250px"
          src={images[index]}
        />
      ) : (
        <svg aria-hidden="true" className="h-full w-full" role="img">
          <use href="/assets/sprite.svg#no-image" />
        </svg>
      )}

      {images.length > 1 ? (
        <>
          <button
            className={`
              absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 transform
              rounded-full bg-neutral/25 text-2xl text-on-surface
              hover:bg-neutral/50 hover:font-bold
            `}
            onClick={prevImage}
            type="button"
          >
            ←
          </button>

          <button
            className={`
              absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform
              cursor-pointer rounded-full bg-neutral/25 text-2xl text-on-surface
              hover:bg-neutral/50 hover:font-bold
            `}
            onClick={nextImage}
            type="button"
          >
            →
          </button>
        </>
      ) : null}
    </div>
  );
};
