import { useI18n } from "~/i18n/useI18n";
import { gbp } from "./formulas";
import type { CalculationResult } from "./types";
import { RichText } from "~/components/ui/RichText/RichText";

// ── ResultRow ─────────────────────────────────────────────────────────────────

type ResultRowProps = {
  readonly label: string;
  readonly value: number;
  readonly highlight?: boolean;
};

function ResultRow({ label, value, highlight = false }: ResultRowProps) {
  return (
    <div className={`result-row ${highlight ? "highlight" : ""}`}>
      <span className="result-label">{label}</span>
      <span className={`result-value ${value < 0 ? "negative" : "positive"}`}>{gbp(value)}</span>
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
    <div className={`summary-banner ${buyingBetter ? "buying-better" : "renting-better"}`}>
      <div className="summary-icon">{buyingBetter ? "🏠" : "🏦"}</div>
      <div>
        <div className="summary-title">{i18n("After {years} years...", { years })}</div>
        <RichText className="dark text-xl text-white">
          {i18n("{item} is better by **{amount}**", {
            item: buyingBetter ? i18n("Buying") : i18n("Renting"),
            amount: gbp(diff),
          })}
        </RichText>
      </div>
    </div>
  );
};

// ── BuyingBreakdown ───────────────────────────────────────────────────────────

const BuyingBreakdown = ({ result }: { result: CalculationResult }) => {
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
    buyingNet,
  } = result;

  return (
    <div
      className={`border-neutral-disabled bg-surface/70 flex-col justify-between rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4`}
    >
      <h3 className="col-title buying-title">{i18n("{years}-Year Buying Insights", { years })}</h3>
      <ResultRow label={i18n("Deposit")} value={-deposit} />
      <ResultRow label={i18n("Stamp Duty")} value={-stampDuty} />
      <ResultRow label={i18n("Mortgage payments")} value={-totalMortgagePayments} />
      <ResultRow label={i18n("Equity value")} value={equity} />
      <ResultRow label={i18n("Initial buying costs")} value={-initialBuyingCosts} />
      <ResultRow label={i18n("Repairs & maintenance")} value={-maintenance} />
      <ResultRow label={i18n("Home insurance")} value={-totalInsurance} />
      <ResultRow label={i18n("Selling fees")} value={-sellingFees} />
      <ResultRow label={i18n("Net gain/loss")} value={buyingNet} highlight />
    </div>
  );
};

// ── RentingBreakdown ──────────────────────────────────────────────────────────

const RentingBreakdown = ({ result }: { result: CalculationResult }) => {
  const i18n = useI18n();

  const { years, initialSavings, returnOnInitialSavings, ongoingSavings, rentPaid, rentingNet } = result;

  return (
    <div
      className={`border-neutral-disabled bg-surface/70 flex-col justify-between rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4`}
    >
      <h3 className="col-title renting-title">{i18n("{years}-Year Renting Insights", { years })}</h3>
      <ResultRow label={i18n("Savings from not buying")} value={initialSavings} />
      <ResultRow label={i18n("Return on initial savings")} value={returnOnInitialSavings} />
      <ResultRow label={i18n("Return on ongoing savings")} value={ongoingSavings} />
      <ResultRow label={i18n("Rent paid")} value={-rentPaid} />
      <ResultRow label={i18n("Net gain/loss")} value={rentingNet} highlight />
    </div>
  );
};

// ── ResultsPanel ──────────────────────────────────────────────────────────────

type ResultsPanelProps = {
  readonly result: CalculationResult;
  readonly children: React.ReactNode;
};

export default function ResultsPanel({ result, children }: ResultsPanelProps) {
  const i18n = useI18n();

  return (
    <div className="flex flex-col gap-y-6 md:gap-y-8">
      <SummaryBanner buyingNet={result.buyingNet} rentingNet={result.rentingNet} years={result.years} />

      <div
        className={`border-neutral-disabled bg-surface/70 flex justify-between rounded-xl border px-4 py-3 shadow-sm md:px-5 md:py-4`}
      >
        <span className="text-neutral">{i18n("Monthly mortgage payment")}</span>
        <strong className="text-primary">{gbp(result.monthlyMortgage)}</strong>
      </div>

      <div className="grid gap-x-6 md:grid-cols-2">
        <BuyingBreakdown result={result} />
        <RentingBreakdown result={result} />
      </div>

      {children}
    </div>
  );
}
