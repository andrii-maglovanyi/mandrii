import { Button } from "../Button/Button";

export interface NumberedPaginationProps {
  index: number;
  nextText?: string;
  onChange: (page: number) => void;
  prevText?: string;
  size?: "lg" | "md" | "sm";
  total: number;
}

const RANGE = 7;

function getVisiblePages(index: number, total: number): (number | string)[] {
  if (total <= RANGE) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];
  const showStartEllipsis = index > 4;
  const showEndEllipsis = index < total - 3;

  const start = Math.max(2, Math.min(index - 1, total - 4));
  const end = Math.min(total - 1, start + 3);

  if (showStartEllipsis) pages.push("start-ellipsis");

  for (let i = start; i <= end; i++) pages.push(i);

  if (showEndEllipsis) pages.push("end-ellipsis");

  pages.push(total);
  return pages;
}

export const NumberedPagination = ({
  index,
  nextText = "Next",
  onChange,
  prevText = "Back",
  size = "md",
  total,
}: NumberedPaginationProps) => {
  const pages = getVisiblePages(index, total);

  const renderPage = (page: number | string) => {
    if (typeof page === "string") {
      return (
        <span className="text-neutral mx-2 px-1.5" key={page}>
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
        disabled={index === total}
        onClick={() => onChange(Math.min(index + 1, total))}
        size={size}
        variant="ghost"
      >
        {nextText} →
      </Button>
    </div>
  );
};
