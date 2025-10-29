import { useEffect, useRef } from "react";

import { AnimatedEllipsis } from "../AnimatedEllipsis/AnimatedEllipsis";

export interface InfiniteScrollProps {
  count: number;
  index: number;
  loading?: boolean;
  onScroll: (page: number) => void;
  threshold?: number;
}

export const InfiniteScroll = ({ count, index, loading = false, onScroll, threshold = 300 }: InfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index >= count) return;
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading) {
          if (index >= count) return;
          onScroll(index + 1);
        }
      },
      { rootMargin: `0px 0px ${threshold}px 0px` },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [index, count, loading, onScroll, threshold]);

  return (
    <>
      {loading && <AnimatedEllipsis size="md" />}
      <div className="h-1" ref={sentinelRef} />
    </>
  );
};
