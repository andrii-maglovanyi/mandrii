import { clsx } from "clsx";

type ResultRowProps = {
  readonly label: string;
  readonly value: number;
  readonly isInformational?: boolean;
  readonly highlight?: boolean;
  readonly explanation?: string;
  readonly showHints?: boolean;
  readonly formatCurrency: (value: number) => string;
};

/**
 * A single labelled financial row in the results panel.
 * - Positive values are green, negative are red, zero is neutral.
 * - When showHints is true and an explanation is provided, it renders below the row.
 */
export function ResultRow({
  label,
  value,
  isInformational = false,
  highlight = false,
  explanation,
  showHints = false,
  formatCurrency,
}: ResultRowProps) {
  return (
    <div
      className={
        highlight
          ? "bg-neutral-disabled/20 mt-1.5 flex flex-col rounded-md px-2 py-3 text-[0.95rem] font-bold"
          : "hover:bg-neutral/10 flex flex-col rounded py-2 text-[0.85rem] transition-colors"
      }
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className={`min-w-0 flex-1 ${highlight ? "text-on-surface" : "text-neutral"}`}>{label}</span>
        <span
          className={clsx(
            "shrink-0 font-semibold tabular-nums",
            isInformational ? "text-neutral" : value < 0 ? "text-danger" : value > 0 ? "text-success" : "text-neutral",
          )}
        >
          {formatCurrency(value)}
        </span>
      </div>
      {showHints && explanation && (
        <p className="text-neutral-disabled mt-0.5 w-full text-xs leading-snug">{explanation}</p>
      )}
    </div>
  );
}
