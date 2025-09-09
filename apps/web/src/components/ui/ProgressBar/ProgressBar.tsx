"use client";

import { useEffect, useRef, useState } from "react";

export interface ProgressBarProps {
  isLoading: boolean;
  onLoaded?: () => void;
}

export function ProgressBar({ isLoading, onLoaded }: Readonly<ProgressBarProps>) {
  const [progress, setProgress] = useState(0);
  const animationFrame = useRef<null | number>(null);
  const finishTimeout = useRef<NodeJS.Timeout | null>(null);

  const increaseProgress = () => {
    setProgress((prev) => {
      if (prev >= 98) return prev;

      const next = prev + (100 - prev) * 0.001; // slowing effect
      return Math.min(next, 98);
    });
  };

  useEffect(() => {
    if (isLoading) {
      const loop = () => {
        increaseProgress();
        animationFrame.current = requestAnimationFrame(loop);
      };

      animationFrame.current = requestAnimationFrame(loop);
    } else {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      setProgress(100);

      finishTimeout.current = setTimeout(() => {
        onLoaded?.();
      }, 500);
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (finishTimeout.current) {
        clearTimeout(finishTimeout.current);
      }
    };
  }, [isLoading, onLoaded]);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200">
      <div
        className={`
          h-full rounded bg-gradient-to-r from-primary to-secondary
          transition-all duration-200
        `}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
