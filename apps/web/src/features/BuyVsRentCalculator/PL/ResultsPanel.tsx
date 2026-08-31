import { useI18n } from "~/i18n/useI18n";
import { pln } from "./formulas";
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
    pccTaxAmount,
    notaryCosts,
    agentFee,
    totalMortgagePayments,
    equity,
    maintenance,
    totalInsurance,
    totalBuildingAdminFees,
    totalPropertyTax,
    totalRefinancingCosts,
    sellingFees,
    buyingNet,
  } = result;

  return (
    <div className="border-neutral-disabled bg-surface/70 flex flex-col gap-y-1 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
      <h3 className="text-primary border-primary/20 mb-4 border-b-2 pb-2.5 text-[0.9rem] font-bold tracking-[0.08em] uppercase">
        {i18n("{years}-Year Buying Insights", { years })}
      </h3>

      <ResultRow
        label={i18n("Equity value")}
        value={equity}
        showHints={showHints}
        explanation={i18n(
          "Projected property value minus remaining mortgage balance at the end of your chosen period - what you'd receive when selling.",
        )}
        formatCurrency={pln}
      />
      <ResultRow
        label={i18n("Down payment (wkład własny)")}
        value={-deposit}
        showHints={showHints}
        explanation={i18n(
          "The upfront cash you put in. It becomes part of your equity immediately, but is capital you can no longer invest.",
        )}
        formatCurrency={pln}
      />
      {pccTaxAmount > 0 && (
        <ResultRow
          label={i18n("PCC tax (podatek od czynności cywilnoprawnych)")}
          value={-pccTaxAmount}
          showHints={showHints}
          explanation={i18n(
            "2% civil-law transactions tax on secondary market purchases. Exempt for first-time buyers (since Aug 2023) and primary market (developer) purchases.",
          )}
          formatCurrency={pln}
        />
      )}
      <ResultRow
        label={i18n("Notary & court costs (taksa notarialna)")}
        value={-notaryCosts}
        showHints={showHints}
        explanation={i18n(
          "Mandatory notarisation of the purchase contract, plus land register (KW) entry fee. Scales with the property price; typically 3,000-6,000 zł.",
        )}
        formatCurrency={pln}
      />
      {agentFee > 0 && (
        <ResultRow
          label={i18n("Buyer's agent fee (prowizja pośrednika)")}
          value={-agentFee}
          showHints={showHints}
          explanation={i18n(
            "Commission paid to the buyer's real estate agent. Negotiable; typically 1.5-3% of the purchase price. Not required if the agent is seller-only.",
          )}
          formatCurrency={pln}
        />
      )}
      <ResultRow
        label={i18n("Mortgage payments")}
        value={-totalMortgagePayments}
        showHints={showHints}
        explanation={i18n(
          "Total capital and interest payments made over your chosen period. Includes only years within the mortgage term.",
        )}
        formatCurrency={pln}
      />
      <ResultRow
        label={i18n("Repairs & maintenance")}
        value={-maintenance}
        showHints={showHints}
        explanation={i18n(
          "Estimated upkeep inside the flat each year (% of property value, growing with appreciation) plus initial renovation spend (stan deweloperski fit-out).",
        )}
        formatCurrency={pln}
      />
      <ResultRow
        label={i18n("Home insurance (ubezpieczenie mieszkania)")}
        value={-totalInsurance}
        showHints={showHints}
        explanation={i18n(
          "Private home insurance for contents and liability, required by most lenders. Building insurance is typically included in the czynsz administracyjny.",
        )}
        formatCurrency={pln}
      />
      <ResultRow
        label={i18n("Building admin fees (czynsz administracyjny)")}
        value={-totalBuildingAdminFees}
        showHints={showHints}
        explanation={i18n(
          "Monthly charges to the wspólnota / spółdzielnia: mandatory renovation fund (fundusz remontowy), building insurance, common area maintenance and administration.",
        )}
        formatCurrency={pln}
      />
      {totalPropertyTax > 0 && (
        <ResultRow
          label={i18n("Property tax (podatek od nieruchomości)")}
          value={-totalPropertyTax}
          showHints={showHints}
          explanation={i18n(
            "Annual municipal area-based property tax. Max 1.19 zł/m²/year for residential property (2025 statutory maximum). Very low compared to DE/GB value-based taxes.",
          )}
          formatCurrency={pln}
        />
      )}
      <ResultRow
        label={i18n("Selling fees")}
        value={-sellingFees}
        showHints={showHints}
        explanation={i18n(
          "Costs on future sale: agent commission (~2%) plus notary for the sale contract (~0.5%), applied to the projected future sale price.",
        )}
        formatCurrency={pln}
      />
      {totalRefinancingCosts > 0 && (
        <ResultRow
          label={i18n("Refinancing costs")}
          value={-totalRefinancingCosts}
          showHints={showHints}
          explanation={i18n(
            "Bank processing fee and mortgage hypothek amendment costs each time your fixed-rate period ends and you negotiate a new rate.",
          )}
          formatCurrency={pln}
        />
      )}

      <div className="border-neutral-disabled mt-2 border-t pt-2">
        <ResultRow
          label={i18n("Net gain/loss")}
          value={buyingNet}
          highlight
          showHints={showHints}
          explanation={i18n(
            "Everything added together: equity gained minus all costs paid. A negative number means buying cost you more than you got back - but you had a home to live in.",
          )}
          formatCurrency={pln}
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
        formatCurrency={pln}
      />

      <div className="border-neutral-disabled bg-surface/70 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
        <span className="text-neutral">{i18n("Monthly mortgage payment (rata kredytu)")}</span>
        <strong className="text-primary">{pln(result.monthlyMortgage)}</strong>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <BuyingBreakdown result={result} showHints={showHints} />
        <RentingBreakdown result={result} showHints={showHints} formatCurrency={pln} />
      </div>

      {children}
    </div>
  );
}
