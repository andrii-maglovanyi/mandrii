"use client";

import { useEffect, useMemo, useState } from "react";
import { Home } from "lucide-react";
import { Card, Separator, UnionJack } from "~/components/ui";
import { calculate, buildChartData } from "./calc/formulas";
import InputsPanel from "./calc/InputsPanel";
import ResultsPanel from "./calc/ResultsPanel";
import CostChart from "./calc/CostChart";
import type { CalculatorInputs, InputSetter } from "./calc/types";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

export const DEFAULT_INPUTS: CalculatorInputs = {
  propertyValue: 500_000,
  deposit: 50_000,
  mortgageRate: 4.5,
  mortgageTerm: 30,
  firstTimeBuyer: true,
  propertyAppreciation: 2.5,
  initialBuyingCosts: 5_000,
  initialRepairCosts: 5_000,
  saleFeesPct: 1,
  maintenancePct: 1,
  annualHomeInsurance: 500,
  mortgageArrangementFee: 1_000,
  remortgagingFrequencyYears: 5,
  averageRemortgagingCost: 500,
  serviceCharge: 0,
  groundRent: 0,
  returnOnSavings: 4.0,
  monthlyRent: 2_200,
  rentIncrease: 3,
  tenancyDeposit: Math.round(((2_200 * 12) / 52) * 5),
  years: 7,
};

export const BuyVsRentCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const set: InputSetter = (key) => (val) =>
    setInputs((prev) => ({ ...prev, [key]: val }));
  const result = useMemo(() => calculate(inputs), [inputs]);
  const chartData = useMemo(() => buildChartData(inputs), [inputs]);
  const i18n = useI18n();
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    sendToMixpanel("Computed Buy vs Rent Outcome", {
      computeResult: result,
      currentInputs: inputs,
      source: "buy_vs_rent_calculator",
    });
  }, [result]); // mirrors ILR pattern — fires on every result change

  return (
    <Card
      className={`md:border-primary md:bg-surface mx-auto h-max overflow-hidden rounded-3xl md:border-2 md:shadow-xl`}
    >
      <div
        className={`relative z-10 overflow-hidden rounded-3xl px-2 py-6 sm:py-9 md:rounded-none md:px-8 md:py-12`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden`}
          >
            <UnionJack
              className={`absolute top-1/2 left-0 h-[140%] w-[70%] -translate-y-1/2 transform opacity-15`}
              style={{
                maskImage:
                  "linear-gradient(90deg, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 55%, var(--color-surface) 100%)",
              }}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 55%, var(--color-surface) 100%)",
            }}
          />
        </div>

        <div className={`z-50 flex items-start gap-3 md:py-2 lg:py-6`}>
          <div
            className={`bg-primary text-surface flex min-h-12 min-w-12 items-center justify-center rounded-2xl shadow-md`}
          >
            <Home className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h1
              className={`text-on-surface text-xl font-bold md:text-2xl lg:text-3xl`}
            >
              {i18n("UK Buy vs Rent Calculator")}
            </h1>
            <p className="text-neutral max-w-4xl">
              {i18n(
                "Compare buying and renting scenarios based on your UK property details",
              )}
            </p>
          </div>
        </div>
      </div>

      <div className={`space-y-6 px-4 pt-4 md:px-12 md:py-8`}>
        <InputsPanel
          inputs={inputs}
          set={set}
          showHints={showHints}
          onToggleHints={() => setShowHints((v) => !v)}
        />

        <Separator align="center" text={i18n("Results ↓")} variant="full" />

        <ResultsPanel result={result} showHints={showHints}>
          <CostChart data={chartData} years={inputs.years} />
        </ResultsPanel>

        <div className="py-5">
          <p className="text-neutral mb-2 font-semibold uppercase">
            {i18n("Glossary")}
          </p>
          <ul
            className={`text-neutral list-inside list-disc space-y-4 md:space-y-2`}
          >
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Stamp Duty Land Tax (SDLT)")}
              </span>{" "}
              -{" "}
              {i18n(
                'A tax paid when buying property in England and Northern Ireland. First-time buyers get relief: 0% up to £300k, then 5% on the portion between £300k–£500k. Above £500k (the "cliff-edge"), relief ends and standard rates apply: tiered from 0% on the first £125k to 12% above £1.5m. This creates a discontinuity where a £500,001 property pays ~£15k (3%) while a £500,000 property pays only £10k (2%), reflecting the policy\'s aim to support buyers up to that threshold.',
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Loan-to-Value (LTV)")}
              </span>{" "}
              -{" "}
              {i18n(
                "The ratio of your mortgage to the property value. Lower LTV means a larger deposit and typically better mortgage rates.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Mortgage rate")}
              </span>{" "}
              -{" "}
              {i18n(
                "The annual interest rate on your loan. Based on current UK market rates; your actual rate depends on your credit profile and deposit size.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Equity")}
              </span>{" "}
              -{" "}
              {i18n(
                "The portion of your property you own outright. It increases as you pay down your mortgage and as property value appreciates.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Property appreciation")}
              </span>{" "}
              -{" "}
              {i18n(
                "The expected annual percentage increase in your property's value. Historical UK average is around 2.5-3% per year, but varies by region.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Return on savings")}
              </span>{" "}
              -{" "}
              {i18n(
                "The assumed annual return on money invested instead of spent on buying. The modelled investment base is: deposit + stamp duty + initial buying costs + repair budget (minus tenancy deposit, which is locked until you move out). The calculator defaults to 4% — roughly in line with UK cash ISA or cautious equity returns.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Maintenance & repairs")}
              </span>{" "}
              -{" "}
              {i18n(
                "Annual costs for homeownership. Common guidance is 0.5-1% of property value per year, covering boiler repairs, roof work, etc.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Home insurance")}
              </span>{" "}
              -{" "}
              {i18n(
                "Buildings insurance is typically required by your mortgage lender. Costs vary by location, property value, and claims history.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Selling fees")}
              </span>{" "}
              -{" "}
              {i18n(
                "Estate agent commission (typically 1-2%) on the future sale price, plus VAT. Solicitor conveyancing fees at sale (typically £1,000-£2,000) are not separately modelled — increase your Sale fees % slightly to account for them (e.g. on a £500k property a £1,500 solicitor fee ≈ +0.3%).",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Mortgage arrangement fee")}
              </span>{" "}
              -{" "}
              {i18n(
                "A one-off fee charged by the lender to set up your mortgage, typically £0-£2,000. Some deals have no fee but offer a slightly higher rate instead — compare total cost before choosing.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Remortgaging")}
              </span>{" "}
              -{" "}
              {i18n(
                "UK fixed-rate mortgage deals typically last 2-5 years. When your deal ends you must remortgage (switch to a new deal) or revert to the lender's standard variable rate, which is usually much higher. Each remortgage may incur broker and bank fees.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Service charge & ground rent")}
              </span>{" "}
              -{" "}
              {i18n(
                "Leasehold-specific costs. Service charge covers shared building maintenance (lifts, cleaning, communal repairs) and can vary year to year. Ground rent is an annual payment to the freeholder — but note: the Leasehold Reform (Ground Rent) Act 2022 banned ground rent on new residential leases from 30 April 2022, so ground rent only applies on existing pre-2022 leases. The Leasehold and Freehold Reform Act 2024 additionally bans the grant of new long leases of houses (new-build houses must be sold freehold) and gives existing leaseholders stronger service charge transparency rights.",
              )}
            </li>
            <li>
              <span className="text-on-surface font-semibold">
                {i18n("Tenancy deposit")}
              </span>{" "}
              -{" "}
              {i18n(
                "UK law caps tenancy deposits at 5 weeks' rent (Tenant Fees Act 2019). The deposit is held in a government-approved scheme and returned when you leave (assuming no damage). While held, it is unavailable for investment — the calculator models this as a reduction in your investable capital. Under the Renters' Rights Act 2025 (Royal Assent October 2025), all private tenancies in England are now rolling periodic — tenants can leave with 2 months' notice, with no mandatory fixed term.",
              )}
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
