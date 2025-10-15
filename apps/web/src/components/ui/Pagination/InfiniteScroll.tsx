import { useEffect, useRef } from "react";

import { AnimatedEllipsis } from "../AnimatedEllipsis/AnimatedEllipsis";

export interface InfiniteScrollProps {
  index: number;
  loading?: boolean;
  onScroll: (page: number) => void;
  threshold?: number;
  total: number;
}

export const InfiniteScroll = ({ index, loading = false, onScroll, threshold = 300, total }: InfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index >= total) return;
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading) {
          if (index >= total) return;
          onScroll(index + 1);
        }
      },
      { rootMargin: `0px 0px ${threshold}px 0px` },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [index, total, loading, onScroll, threshold]);

  return (
    <>
      {loading && <AnimatedEllipsis size="md" />}
      <div className="h-1" ref={sentinelRef} />
    </>
  );
};
