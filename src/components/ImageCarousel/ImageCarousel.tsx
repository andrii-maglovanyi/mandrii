"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: Array<string>;
}

export const ImageCarousel = ({ images }: ImageCarouselProps) => {
  const [index, setIndex] = useState(0);

  const nextImage = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full overflow-hidden min-w-20 md:min-w-40">
      <Image
        src={images[index]}
        alt={`Image ${index + 1}`}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 350px, 250px"
      />

      {images.length > 1 ? (
        <>
          <button
            onClick={prevImage}
            className="absolute font-leOsler text-2xl left-2 top-1/2 transform -translate-y-1/2 bg-primary-1000/50 hover:bg-primary-1000/80 hover:font-bold text-white w-8 h-8 rounded-full"
          >
            ←
          </button>

          <button
            onClick={nextImage}
            className="absolute font-leOsler text-2xl  right-2 top-1/2 transform -translate-y-1/2 bg-primary-1000/50 hover:bg-primary-1000/80 hover:font-bold text-white w-8 h-8 rounded-full"
          >
            →
          </button>
        </>
      ) : null}
    </div>
  );
};
