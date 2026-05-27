import { useI18n } from "~/i18n/useI18n";
import { RichText } from "~/components/ui/RichText/RichText";

type SummaryBannerProps = {
  readonly buyingNet: number;
  readonly rentingNet: number;
  readonly years: number;
  readonly formatCurrency: (value: number) => string;
};

/**
 * Top-level banner declaring which path (buying / renting) is financially better
 * after the chosen number of years, and by how much.
 */
export const SummaryBanner = ({ buyingNet, rentingNet, years, formatCurrency }: SummaryBannerProps) => {
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
            amount: formatCurrency(diff),
          })}
        </RichText>
      </div>
    </div>
  );
};
