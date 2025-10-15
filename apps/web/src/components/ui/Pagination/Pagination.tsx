"use client";

import { useMediaQuery } from "react-responsive";

import { InfiniteScroll } from "./InfiniteScroll";
import { NumberedPagination } from "./NumberedPagination";

export interface PaginationProps {
  index: number;
  loading?: boolean;
  onPaginate: (page: number) => void;
  size?: "lg" | "md" | "sm";
  total: number;
}

export const Pagination = ({ index, loading, onPaginate, size = "md", total }: PaginationProps) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  if (total <= 1) return null;

  return (
    <nav aria-label="Pagination">
      {isMobile ? (
        <div className="md:hidden">
          <InfiniteScroll index={index} loading={loading} onScroll={onPaginate} total={total} />
        </div>
      ) : (
        <div className={`
          hidden
          md:flex
        `}>
          <NumberedPagination index={index} onChange={onPaginate} size={size} total={total} />
        </div>
      )}
    </nav>
  );
};
