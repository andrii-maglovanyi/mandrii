import { useI18n } from "~/i18n/useI18n";
import type { RentingMetrics, SummaryMetrics } from "../common";
import { ResultRow } from "./ResultRow";

type RentingBreakdownProps = {
  readonly result: RentingMetrics & SummaryMetrics;
  readonly showHints: boolean;
  readonly formatCurrency: (value: number) => string;
};

/**
 * Renting cost breakdown - identical structure across all country calculators.
 * Shows initial savings, investment returns, rent paid, and net gain/loss.
 */
export const RentingBreakdown = ({ result, showHints, formatCurrency }: RentingBreakdownProps) => {
  const i18n = useI18n();

  const { years, initialSavings, returnOnInitialSavings, ongoingSavings, rentPaid, rentingNet } = result;

  return (
    <div className="border-neutral-disabled bg-surface/70 flex flex-col gap-y-1 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
      <h3 className="mb-4 border-b-2 border-emerald-600/20 pb-2.5 text-[0.9rem] font-bold tracking-[0.08em] text-emerald-600 uppercase">
        {i18n("{years}-Year Renting Insights", { years })}
      </h3>

      <ResultRow
        label={i18n("Savings from not buying")}
        value={initialSavings}
        showHints={showHints}
        explanation={i18n(
          "Capital you keep by not buying: deposit, taxes, buying costs, repair budget, and first year's insurance. Shown for reference - the actual investment base used for return calculations may exclude certain items.",
        )}
        formatCurrency={formatCurrency}
      />
      <ResultRow
        label={i18n("Return on initial savings")}
        value={returnOnInitialSavings}
        showHints={showHints}
        explanation={i18n(
          "Investment growth on that initial pot over the full period, compounded annually at your chosen savings return rate.",
        )}
        formatCurrency={formatCurrency}
      />
      <ResultRow
        label={i18n("Return on ongoing savings")}
        value={ongoingSavings}
        showHints={showHints}
        explanation={i18n(
          "If your mortgage payment would be higher than your rent, the difference is invested each year and compounds. Only applies when mortgage > rent.",
        )}
        formatCurrency={formatCurrency}
      />
      <ResultRow
        label={i18n("Rent paid")}
        value={-rentPaid}
        showHints={showHints}
        explanation={i18n("Total rent paid over the period, rising by your expected annual rent increase each year.")}
        formatCurrency={formatCurrency}
      />

      <div className="border-neutral-disabled mt-2 border-t pt-2">
        <ResultRow
          label={i18n("Net gain/loss")}
          value={rentingNet}
          highlight
          showHints={showHints}
          explanation={i18n(
            "Investment returns minus rent paid, plus your deposit returned. A negative number means renting cost you more than your investments returned.",
          )}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};
