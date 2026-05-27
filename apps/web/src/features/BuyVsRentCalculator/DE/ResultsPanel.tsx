import { useI18n } from "~/i18n/useI18n";
import { eur } from "./formulas";
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
    transferTaxAmount,
    buyerAgentFee,
    notaryAndLandRegistryCosts,
    totalMortgagePayments,
    equity,
    maintenance,
    totalInsurance,
    sellingFees,
    totalRefinancingCosts,
    totalCondoFees,
    totalPropertyTax,
    buyingNet,
  } = result;

  return (
    <div className="border-neutral-disabled bg-surface/70 flex flex-col gap-y-1 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
      <h3 className="text-primary border-primary/20 mb-4 border-b-2 pb-2.5 text-[0.9rem] font-bold tracking-[0.08em] uppercase">
        {i18n("{years}-Year Buying Insights", { years })}
      </h3>

      <ResultRow
        label={i18n("Deposit")}
        value={-deposit}
        showHints={showHints}
        explanation={i18n(
          "The upfront cash you put in. It becomes part of your equity immediately, but it's capital you no longer have available to invest.",
        )}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Transfer tax (Grunderwerbsteuer)")}
        value={-transferTaxAmount}
        showHints={showHints}
        explanation={i18n(
          "State transfer tax on property acquisition, ranging from 3.5% to 6.5% depending on the federal state (Bundesland).",
        )}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Buyer's agent fee (Maklerprovision)")}
        value={-buyerAgentFee}
        showHints={showHints}
        explanation={i18n("Commission paid to the real estate agent for facilitating the purchase.")}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Notary & land registry costs")}
        value={-notaryAndLandRegistryCosts}
        showHints={showHints}
        explanation={i18n(
          "Fees for notary services and land registry entry (Grundbuch) - typically 1-2% of property value.",
        )}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Mortgage payments")}
        value={-totalMortgagePayments}
        showHints={showHints}
        explanation={i18n(
          "Total capital and interest payments made to the bank over your chosen period. Includes only years within the mortgage term.",
        )}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Equity value")}
        value={equity}
        showHints={showHints}
        explanation={i18n(
          "What you'd receive when selling: the projected property value minus any remaining mortgage balance. Calculated at the start of your final year.",
        )}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Repairs & maintenance")}
        value={-maintenance}
        showHints={showHints}
        explanation={i18n(
          "Estimated upkeep costs each year (as a % of property value, growing with appreciation), plus any initial renovation spend.",
        )}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Home insurance")}
        value={-totalInsurance}
        showHints={showHints}
        explanation={i18n("Buildings insurance paid each year. Usually a mortgage requirement.")}
        formatCurrency={eur}
      />
      <ResultRow
        label={i18n("Selling fees")}
        value={-sellingFees}
        showHints={showHints}
        explanation={i18n("Estate agent commission on the projected future sale price.")}
        formatCurrency={eur}
      />
      {totalRefinancingCosts > 0 && (
        <ResultRow
          label={i18n("Refinancing costs (Anschlussfinanzierung)")}
          value={-totalRefinancingCosts}
          showHints={showHints}
          explanation={i18n("Broker and bank fees for refinancing when your fixed-rate period ends.")}
          formatCurrency={eur}
        />
      )}
      {totalCondoFees > 0 && (
        <ResultRow
          label={i18n("Condo fees (Hausgeld)")}
          value={-totalCondoFees}
          showHints={showHints}
          explanation={i18n("Annual charge covering shared building maintenance, utilities, and communal repairs.")}
          formatCurrency={eur}
        />
      )}
      {totalPropertyTax > 0 && (
        <ResultRow
          label={i18n("Property tax (Grundsteuer)")}
          value={-totalPropertyTax}
          showHints={showHints}
          explanation={i18n("Annual municipal property tax, varies by location.")}
          formatCurrency={eur}
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
          formatCurrency={eur}
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
        formatCurrency={eur}
      />

      <div className="border-neutral-disabled bg-surface/70 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
        <span className="text-neutral">{i18n("Monthly mortgage payment")}</span>
        <strong className="text-primary">{eur(result.monthlyMortgage)}</strong>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <BuyingBreakdown result={result} showHints={showHints} />
        <RentingBreakdown result={result} showHints={showHints} formatCurrency={eur} />
      </div>

      {children}
    </div>
  );
}
