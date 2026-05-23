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
  const set: InputSetter = (key) => (val) => setInputs((prev) => ({ ...prev, [key]: val }));
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
  }, [result]); // mirrors ILR pattern - fires on every result change

  return (
    <Card
      className={`md:border-primary md:bg-surface mx-auto h-max overflow-hidden rounded-3xl md:border-2 md:shadow-xl`}
    >
      <div className={`relative z-10 overflow-hidden rounded-3xl px-2 py-6 sm:py-9 md:rounded-none md:px-8 md:py-12`}>
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden`}>
            <UnionJack
              className={`absolute top-1/2 left-0 h-[140%] w-[70%] -translate-y-1/2 transform opacity-15`}
              style={{
                maskImage: "linear-gradient(90deg, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent 55%, var(--color-surface) 100%)",
              }}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent 55%, var(--color-surface) 100%)",
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
            <h1 className={`text-on-surface text-xl font-bold md:text-2xl lg:text-3xl`}>
              {i18n("UK Buy vs Rent Calculator")}
            </h1>
            <p className="text-neutral max-w-4xl">
              {i18n("Compare buying and renting scenarios based on your UK property details")}
            </p>
          </div>
        </div>
      </div>

      <div className={`space-y-6 pt-4 md:px-12 md:py-8`}>
        <InputsPanel inputs={inputs} set={set} showHints={showHints} onToggleHints={() => setShowHints((v) => !v)} />

        <Separator align="center" text={i18n("Results ↓")} variant="full" />

        <ResultsPanel result={result} showHints={showHints}>
          <CostChart data={chartData} years={inputs.years} />
        </ResultsPanel>

        <div className="py-5">
          <p className="text-neutral mb-2 font-semibold uppercase">{i18n("Glossary")}</p>
          <ul className={`text-neutral list-inside list-disc space-y-4 md:space-y-2`}>
            <li>
              <span className="text-on-surface font-semibold">{i18n("Stamp Duty Land Tax (SDLT)")}</span> -{" "}
              {i18n(
                "A property purchase tax in England and Northern Ireland. First-time buyers pay 0% up to £300k, and 5% between £300k–£500k. Important: if the price goes even £1 over £500k, this special discount disappears completely, and standard rates apply from £125k. This is why a £500,001 property triggers a much higher tax (~£15k) than a £500,000 one (£10k).",
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
        </div>
      </div>
    </Card>
  );
};
