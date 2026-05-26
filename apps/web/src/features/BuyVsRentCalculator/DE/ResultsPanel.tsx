import { useI18n } from "~/i18n/useI18n";
import { eur } from "../DE/formulas";
import type { CalculationResult } from "./types";
import { RichText } from "~/components/ui/RichText/RichText";

// ── ResultRow ─────────────────────────────────────────────────────────────────

type ResultRowProps = {
  readonly label: string;
  readonly value: number;
  readonly highlight?: boolean;
  readonly explanation?: string;
  readonly showHints?: boolean;
};

function ResultRow({ label, value, highlight = false, explanation, showHints = false }: ResultRowProps) {
  return (
    <div
      className={
        highlight
          ? "bg-neutral-disabled/20 mt-1.5 flex flex-col rounded-md px-2 py-3 text-[0.95rem] font-bold"
          : "flex flex-col rounded py-2 text-[0.85rem] transition-colors hover:bg-slate-100"
      }
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className={`min-w-0 flex-1 ${highlight ? "text-on-surface" : "text-neutral"}`}>{label}</span>
        <span className={`shrink-0 font-semibold tabular-nums ${value < 0 ? "text-danger" : "text-success"}`}>
          {eur(value)}
        </span>
      </div>
      {showHints && explanation && (
        <p className="text-neutral-disabled mt-0.5 w-full text-xs leading-snug">{explanation}</p>
      )}
    </div>
  );
}

// ── SummaryBanner ─────────────────────────────────────────────────────────────

type SummaryBannerProps = {
  readonly buyingNet: number;
  readonly rentingNet: number;
  readonly years: number;
};

const SummaryBanner = ({ buyingNet, rentingNet, years }: SummaryBannerProps) => {
  const i18n = useI18n();

  const buyingBetter = buyingNet > rentingNet;
  const diff = Math.abs(rentingNet - buyingNet);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-4 text-white shadow-lg sm:gap-[18px] sm:px-7 sm:py-6 ${
        buyingBetter
          ? "to-primary from-primary/70 bg-linear-to-br"
          : "bg-linear-to-br from-emerald-700/70 to-emerald-500"
      }`}
    >
      <div className="shrink-0 text-[2.8rem]">{buyingBetter ? "🏠" : "🏦"}</div>
      <div className="min-w-0">
        <div className="text-[0.95rem] opacity-90">{i18n("After {years} years...", { years })}</div>
        <RichText className="dark text-xl text-white">
          {i18n("{item} is better by **{amount}**", {
            item: buyingBetter ? i18n("Buying") : i18n("Renting"),
            amount: eur(diff),
          })}
        </RichText>
      </div>
    </div>
  );
};

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
    initialRepairCosts,
    maintenance,
    totalInsurance,
    sellingFees,
    refinancingCost,
    totalCondoFees,
    totalPropertyTax,
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
      />
      <ResultRow
        label={i18n("Transfer tax (Grunderwerbsteuer)")}
        value={-transferTaxAmount}
        showHints={showHints}
        explanation={i18n(
          "State transfer tax on property acquisition, ranging from 3.5% to 6.5% depending on the federal state (Bundesland).",
        )}
      />
      <ResultRow
        label={i18n("Buyer's agent fee (Maklerprovision)")}
        value={-buyerAgentFee}
        showHints={showHints}
        explanation={i18n("Commission paid to the real estate agent for facilitating the purchase.")}
      />
      <ResultRow
        label={i18n("Notary & land registry costs")}
        value={-notaryAndLandRegistryCosts}
        showHints={showHints}
        explanation={i18n(
          "Fees for notary services and land registry entry (Grundbuch) - typically 1-2% of property value.",
        )}
      />
      <ResultRow
        label={i18n("Mortgage payments")}
        value={-totalMortgagePayments}
        showHints={showHints}
        explanation={i18n(
          "Total capital and interest payments made to the bank over your chosen period. Includes only years within the mortgage term.",
        )}
      />
      <ResultRow
        label={i18n("Equity value")}
        value={equity}
        showHints={showHints}
        explanation={i18n(
          "What you'd receive when selling: the projected property value minus any remaining mortgage balance. Calculated at the start of your final year.",
        )}
      />
      <ResultRow
        label={i18n("Initial repairs")}
        value={-initialRepairCosts}
        showHints={showHints}
        explanation={i18n("One-off renovation and repair costs at purchase.")}
      />
      <ResultRow
        label={i18n("Repairs & maintenance")}
        value={-maintenance}
        showHints={showHints}
        explanation={i18n(
          "Estimated upkeep costs each year (as a % of property value, growing with appreciation), plus any initial renovation spend.",
        )}
      />
      <ResultRow
        label={i18n("Home insurance")}
        value={-totalInsurance}
        showHints={showHints}
        explanation={i18n("Buildings insurance paid each year. Usually a mortgage requirement.")}
      />
      <ResultRow
        label={i18n("Selling fees")}
        value={-sellingFees}
        showHints={showHints}
        explanation={i18n("Estate agent commission on the projected future sale price.")}
      />
      {refinancingCost > 0 && (
        <ResultRow
          label={i18n("Refinancing costs")}
          value={-refinancingCost}
          showHints={showHints}
          explanation={i18n("Broker and bank fees for refinancing when your fixed-rate period ends.")}
        />
      )}
      {totalCondoFees > 0 && (
        <ResultRow
          label={i18n("Annual condo fees (Nebenkosten)")}
          value={-totalCondoFees}
          showHints={showHints}
          explanation={i18n("Annual charge covering shared building maintenance, utilities, and communal repairs.")}
        />
      )}
      {totalPropertyTax > 0 && (
        <ResultRow
          label={i18n("Property tax (Grundsteuer)")}
          value={-totalPropertyTax}
          showHints={showHints}
          explanation={i18n("Annual municipal property tax, varies by location.")}
        />
      )}

      <div className="border-neutral-disabled mt-2 border-t pt-2">
        <ResultRow
          label={i18n("Net gain/loss")}
          value={buyingNet}
          highlight
          showHints={showHints}
          explanation={i18n(
            "Everything added together: equity gained minus all costs paid. A negative number means buying cost you more than you got back — but you also had a home to live in.",
          )}
        />
      </div>
    </div>
  );
};

// ── RentingBreakdown ──────────────────────────────────────────────────────────

type RentingBreakdownProps = {
  readonly result: CalculationResult;
  readonly showHints: boolean;
};

const RentingBreakdown = ({ result, showHints }: RentingBreakdownProps) => {
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
          "Capital you keep by not buying: deposit, transfer tax, buying costs, repair budget, and first year's insurance. Shown for reference — the actual investment base used for return calculations excludes both insurance and refinancing costs.",
        )}
      />
      <ResultRow
        label={i18n("Return on initial savings")}
        value={returnOnInitialSavings}
        showHints={showHints}
        explanation={i18n(
          "Investment growth on that initial pot over the full period, compounded annually at your chosen savings return rate.",
        )}
      />
      <ResultRow
        label={i18n("Return on ongoing savings")}
        value={ongoingSavings}
        showHints={showHints}
        explanation={i18n(
          "If your mortgage payment would be higher than your rent, the difference is invested each year and compounds. Only applies when mortgage > rent.",
        )}
      />
      <ResultRow
        label={i18n("Rent paid")}
        value={-rentPaid}
        showHints={showHints}
        explanation={i18n("Total rent paid over the period, rising by your expected annual rent increase each year.")}
      />

      <div className="border-neutral-disabled mt-2 border-t pt-2">
        <ResultRow
          label={i18n("Net gain/loss")}
          value={rentingNet}
          highlight
          showHints={showHints}
          explanation={i18n(
            "Investment returns minus rent paid, plus your rental deposit returned. A negative number means renting cost you more than your investments returned.",
          )}
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
      <SummaryBanner buyingNet={result.buyingNet} rentingNet={result.rentingNet} years={result.years} />

      <div className="border-neutral-disabled bg-surface/70 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4">
        <span className="text-neutral">{i18n("Monthly mortgage payment")}</span>
        <strong className="text-primary">{eur(result.monthlyMortgage)}</strong>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <BuyingBreakdown result={result} showHints={showHints} />
        <RentingBreakdown result={result} showHints={showHints} />
      </div>

      {children}
    </div>
  );
}
