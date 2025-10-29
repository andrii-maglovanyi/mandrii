import { Button } from "../Button/Button";

export interface NumberedPaginationProps {
  count: number;
  index: number;
  nextText?: string;
  onChange: (page: number) => void;
  prevText?: string;
  size?: "lg" | "md" | "sm";
}

const RANGE = 7;

function getVisiblePages(index: number, count: number): (number | string)[] {
  if (count <= RANGE) return Array.from({ length: count }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];
  const showStartEllipsis = index > 4;
  const showEndEllipsis = index < count - 3;

  const start = Math.max(2, Math.min(index - 1, count - 4));
  const end = Math.min(count - 1, start + 3);

  if (showStartEllipsis) pages.push("start-ellipsis");

  for (let i = start; i <= end; i++) pages.push(i);

  if (showEndEllipsis) pages.push("end-ellipsis");

  pages.push(count);
  return pages;
}

export const NumberedPagination = ({
  count,
  index,
  nextText = "Next",
  onChange,
  prevText = "Back",
  size = "md",
}: NumberedPaginationProps) => {
  const pages = getVisiblePages(index, count);

  const renderPage = (page: number | string) => {
    if (typeof page === "string") {
      return (
        <span className="mx-2 px-1.5 text-neutral" key={page}>
          ...
        </span>
      );
    }

    return (
      <Button key={page} onClick={() => onChange(page)} size={size} variant={index === page ? "filled" : "ghost"}>
        {page}
      </Button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        data-testid="previous-page"
        disabled={index === 1}
        onClick={() => onChange(Math.max(index - 1, 1))}
        size={size}
        variant="ghost"
      >
        ← {prevText}
      </Button>

      {pages.map(renderPage)}

      <Button
        data-testid="next-page"
        disabled={index === count}
        onClick={() => onChange(Math.min(index + 1, count))}
        size={size}
        variant="ghost"
      >
        {nextText} →
      </Button>
    </div>
  );
};
