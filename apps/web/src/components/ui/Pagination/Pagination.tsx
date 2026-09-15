"use client";

import { useMediaQuery } from "react-responsive";

import { useI18n } from "~/i18n/useI18n";
import { INFINITE_SCROLL_MEDIA_QUERY } from "~/lib/responsive";

import { InfiniteScroll } from "./InfiniteScroll";
import { NumberedPagination } from "./NumberedPagination";

export interface PaginationProps {
  count: number;
  index: number;
  loading?: boolean;
  nextText?: string;
  onPaginate: (page: number) => void;
  prevText?: string;
  size?: "lg" | "md" | "sm";
}

export const Pagination = ({ count, index, loading, nextText, onPaginate, prevText, size = "md" }: PaginationProps) => {
  const i18n = useI18n();
  const isMobile = useMediaQuery({
    query: INFINITE_SCROLL_MEDIA_QUERY,
  });

  if (count <= 1) return null;

  return (
    <nav aria-label={i18n("Pagination")}>
      {isMobile ? (
        <div className="md:hidden">
          <InfiniteScroll count={count} index={index} loading={loading} onScroll={onPaginate} />
        </div>
      ) : (
        <div className={`
          hidden
          md:flex
        `}>
          <NumberedPagination
            count={count}
            index={index}
            nextText={nextText}
            onChange={onPaginate}
            prevText={prevText}
            size={size}
          />
        </div>
      )}
    </nav>
  );
};
