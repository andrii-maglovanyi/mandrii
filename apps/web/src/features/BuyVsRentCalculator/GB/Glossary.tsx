import { useI18n } from "~/i18n/useI18n";

export const Glossary = () => {
  const i18n = useI18n();

  return (
    <ul className={`text-neutral list-inside list-disc space-y-4 md:space-y-2`}>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Stamp Duty Land Tax (SDLT)")}</span> -{" "}
        {i18n(
          "A property purchase tax in England and Northern Ireland. First-time buyers pay 0% up to £300k, and 5% between £300k-£500k. Important: if the price goes even £1 over £500k, this special discount disappears completely, and standard rates apply from £125k. This is why a £500,001 property triggers a much higher tax (~£15k) than a £500,000 one (£10k).",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Loan-to-Value (LTV)")}</span> -{" "}
        {i18n(
          "The size of your mortgage compared to the property's value. A lower LTV means you have a larger deposit, which usually unlocks better mortgage rates.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Mortgage rate")}</span> -{" "}
        {i18n(
          "The annual interest rate on your loan. Based on current UK market trends; your exact rate depends on your credit profile and deposit size.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Equity")}</span> -{" "}
        {i18n(
          "The portion of the property you actually own debt-free. It grows as you pay off your mortgage and as the property's value increases.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Property appreciation")}</span> -{" "}
        {i18n(
          "How much your property's value grows each year. The UK historical average is around 2.5-3%, though this varies by region.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Return on savings")}</span> -{" "}
        {i18n(
          "The estimated annual return if you invested your money instead of buying. The calculator assumes you invest your potential deposit, stamp duty, buying fees, and repair budget (minus your locked tenancy deposit). Defaults to 4% - close to a standard UK cash ISA or low-risk investment.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Maintenance & repairs")}</span> -{" "}
        {i18n(
          "The yearly cost of looking after your home. A good rule of thumb is 0.5-1% of the property's value annually to cover ongoing maintenance like boiler or roof repairs.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Home insurance")}</span> -{" "}
        {i18n(
          "Buildings insurance, which your mortgage lender will typically require you to have. Costs depend on your property and location.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Selling fees")}</span> -{" "}
        {i18n(
          "The costs of selling your home in the future. This includes estate agent commissions (typically 1-2%) and solicitor fees. Hint: increase this percentage slightly to budget for the solicitor.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Mortgage arrangement fee")}</span> -{" "}
        {i18n(
          "A one-off fee charged by the bank to set up your mortgage, typically up to £2,000. Some deals have no fee but charge a slightly higher interest rate instead.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Remortgaging")}</span> -{" "}
        {i18n(
          "UK mortgages usually have a fixed rate for only 2-5 years. When that deal ends, you must switch to a new one (remortgage) to avoid being moved to the bank's much more expensive standard variable rate.",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Service charge & ground rent")}</span> -{" "}
        {i18n(
          "Costs specific to 'leasehold' properties (like most flats). Service charges cover shared building maintenance (lifts, cleaning), while ground rent is an annual fee paid to the landowner (though banned on most newer leases).",
        )}
      </li>
      <li>
        <span className="text-on-surface font-semibold">{i18n("Tenancy deposit")}</span> -{" "}
        {i18n(
          "The money you provide when renting (capped by law at 5 weeks' rent). It is held securely and returned when you move out. The calculator accounts for the fact that this money cannot be invested while you are renting.",
        )}
      </li>
    </ul>
  );
};
