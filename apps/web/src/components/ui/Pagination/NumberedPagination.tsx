import { Button } from "../Button/Button";

export interface NumberedPaginationProps {
  index: number;
  onChange: (page: number) => void;
  size?: "lg" | "md" | "sm";
  total: number;
}

const RANGE = 7;

export const NumberedPagination = ({ index, onChange, size = "md", total }: NumberedPaginationProps) => {
  const pages = [];
  const showStartEllipsis = total > RANGE && (index > 4 || index > RANGE - 1);
  const showEndEllipsis = total > RANGE && (index < 5 || index <= total - 4);

  pages.push(
    <Button key={1} onClick={() => onChange(1)} size={size} variant={index === 1 ? "filled" : "ghost"}>
      1
    </Button>,
  );

  if (showStartEllipsis) {
    pages.push(
      <span className="mx-2 px-1.5 text-neutral" key="ellipsis-start">
        ...
      </span>,
    );
  }

  const start = total > RANGE ? (index > total - 4 ? total - 4 : Math.max(2, index > 4 ? index - 1 : 1)) : 2;
  const end = total > RANGE ? (index > total - 4 ? total - 1 : Math.min(total - 1, Math.max(5, index + 1))) : total - 1;

  for (let i = start; i <= end; i++) {
    pages.push(
      <Button key={i} onClick={() => onChange(i)} size={size} variant={index === i ? "filled" : "ghost"}>
        {i}
      </Button>,
    );
  }

  if (showEndEllipsis) {
    pages.push(
      <span className="mx-2 px-1.5 text-neutral" key="ellipsis-end">
        ...
      </span>,
    );
  }

  if (total > 1) {
    pages.push(
      <Button key={total} onClick={() => onChange(total)} size={size} variant={index === total ? "filled" : "ghost"}>
        {total}
      </Button>,
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <Button
        data-testid="previous-page"
        disabled={index === 1}
        onClick={() => onChange(Math.max(index - 1, 1))}
        size={size}
        variant="ghost"
      >
        ← Previous
      </Button>
      {pages}
      <Button
        data-testid="next-page"
        disabled={index === total}
        onClick={() => onChange(Math.min(index + 1, total))}
        size={size}
        variant="ghost"
      >
        Next →
      </Button>
    </div>
  );
};
