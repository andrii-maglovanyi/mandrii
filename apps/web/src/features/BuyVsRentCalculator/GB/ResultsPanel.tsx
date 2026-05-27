import { useI18n } from "~/i18n/useI18n";
import { gbp } from "./formulas";
import type { CalculationResult } from "./types";
import { ResultRow } from "../shared/ResultRow";
import { SummaryBanner } from "../shared/SummaryBanner";
import { RentingBreakdown } from "../shared/RentingBreakdown";

// ── BuyingBreakdown ───────────────────────────────────────────────────────────

type BuyingBreakdownProps = {
  readonly result: CalculationResult;
  readonly showHints: boolean;
};

const BuyingBreakdown = ({ result, showHints }: BuyingBreakdownProps) => {
  const i18n = useI18n();

  const {
    years,
    deposit,
    stampDuty,
    totalMortgagePayments,
    equity,
    initialBuyingCosts,
    maintenance,
    totalInsurance,
    sellingFees,
    mortgageArrangementFee,
    totalRemortgagingCosts,
    totalServiceCharges,
    totalGroundRent,
    buyingNet,
  } = result;

  return (
    <div className="border-neutral-disabled bg-surface/70 flex flex-col gap-y-1 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
      <h3 className="dark:border- text-primary border-primary/20 mb-4 border-b-2 pb-2.5 text-[0.9rem] font-bold tracking-[0.08em] uppercase">
        {i18n("{years}-Year Buying Insights", { years })}
      </h3>

      <ResultRow
        label={i18n("Deposit")}
        value={-deposit}
        showHints={showHints}
        explanation={i18n(
          "The upfront cash you put in. It becomes part of your equity immediately, but it's capital you no longer have available to invest.",
        )}
        formatCurrency={gbp}
      />
      <ResultRow
        label={i18n("Stamp Duty")}
        value={-stampDuty}
        showHints={showHints}
        explanation={i18n(
          "A one-off UK government tax paid on purchase. First-time buyers get relief on properties up to £500,000.",
        )}
        formatCurrency={gbp}
      />
      <ResultRow
        label={i18n("Mortgage payments")}
        value={-totalMortgagePayments}
        showHints={showHints}
        explanation={i18n(
          "Total capital and interest payments made to the bank over your chosen period. Includes only years within the mortgage term.",
        )}
        formatCurrency={gbp}
      />
      <ResultRow
        label={i18n("Equity value")}
        value={equity}
        showHints={showHints}
        explanation={i18n(
          "What you'd receive when selling: the projected property value minus any remaining mortgage balance. Calculated at the start of your final year.",
        )}
        formatCurrency={gbp}
      />
      <ResultRow
        label={i18n("Initial buying costs")}
        value={-initialBuyingCosts}
        showHints={showHints}
        explanation={i18n(
          "One-off costs at purchase: solicitor's fees, surveys, and other legal and administrative expenses.",
        )}
        formatCurrency={gbp}
      />
      <ResultRow
        label={i18n("Repairs & maintenance")}
        value={-maintenance}
        showHints={showHints}
        explanation={i18n(
          "Estimated upkeep costs each year (as a % of property value, growing with appreciation), plus any initial renovation spend.",
        )}
        formatCurrency={gbp}
      />
      <ResultRow
        label={i18n("Home insurance")}
        value={-totalInsurance}
        showHints={showHints}
        explanation={i18n("Buildings insurance paid each year. Usually a mortgage requirement.")}
        formatCurrency={gbp}
      />
      <ResultRow
        label={i18n("Selling fees")}
        value={-sellingFees}
        showHints={showHints}
        explanation={i18n("Estate agent commission on the projected future sale price.")}
        formatCurrency={gbp}
      />
      {mortgageArrangementFee > 0 && (
        <ResultRow
          label={i18n("Mortgage arrangement fee")}
          value={-mortgageArrangementFee}
          showHints={showHints}
          explanation={i18n("One-time fee charged by the bank to set up your mortgage.")}
          formatCurrency={gbp}
        />
      )}
      {totalRemortgagingCosts > 0 && (
        <ResultRow
          label={i18n("Remortgaging costs")}
          value={-totalRemortgagingCosts}
          showHints={showHints}
          explanation={i18n(
            "Broker and bank fees each time you switch to a new mortgage deal over your ownership period.",
          )}
          formatCurrency={gbp}
        />
      )}
      {totalServiceCharges > 0 && (
        <ResultRow
          label={i18n("Service charges")}
          value={-totalServiceCharges}
          showHints={showHints}
          explanation={i18n(
            "Annual leasehold charge covering shared building maintenance, cleaning, and communal repairs.",
          )}
          formatCurrency={gbp}
        />
      )}
      {totalGroundRent > 0 && (
        <ResultRow
          label={i18n("Ground rent")}
          value={-totalGroundRent}
          showHints={showHints}
          explanation={i18n("Annual payment to the freeholder for use of the land your property sits on.")}
          formatCurrency={gbp}
        />
      )}

      <div className="border-neutral-disabled mt-2 border-t pt-2">
        <ResultRow
          label={i18n("Net gain/loss")}
          value={buyingNet}
          highlight
          showHints={showHints}
          explanation={i18n(
            "Everything added together: equity gained minus all costs paid. A negative number means buying cost you more than you got back - but you also had a home to live in.",
          )}
          formatCurrency={gbp}
        />
      </div>
    </div>
  );
};

// ── ResultsPanel ──────────────────────────────────────────────────────────────

type ResultsPanelProps = {
  readonly result: CalculationResult;
  readonly showHints: boolean;
  readonly children: React.ReactNode;
};

export default function ResultsPanel({ result, showHints, children }: ResultsPanelProps) {
  const i18n = useI18n();

  return (
    <div className="flex flex-col gap-y-6 md:gap-y-8">
      <SummaryBanner
        buyingNet={result.buyingNet}
        rentingNet={result.rentingNet}
        years={result.years}
        formatCurrency={gbp}
      />

      <div className="border-neutral-disabled bg-surface/70 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
        <span className="text-neutral">{i18n("Monthly mortgage payment")}</span>
        <strong className="text-primary">{gbp(result.monthlyMortgage)}</strong>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <BuyingBreakdown result={result} showHints={showHints} />
        <RentingBreakdown result={result} showHints={showHints} formatCurrency={gbp} />
      </div>

      {children}
    </div>
  );
}
