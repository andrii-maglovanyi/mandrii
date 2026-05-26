"use client";

import { useEffect, useMemo, useState } from "react";
import { Home } from "lucide-react";
import { Card, Separator, UnionJack } from "~/components/ui";
import { calculate, buildChartData } from "./GB/calc/formulas";
import InputsPanel from "./GB/calc/InputsPanel";
import ResultsPanel from "./GB/calc/ResultsPanel";
import CostChart from "./GB/calc/CostChart";
import type { CalculatorInputs, InputSetter } from "./GB/calc/types";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

export const DEFAULT_INPUTS_GB: CalculatorInputs = {
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

export const BuyVsRentCalculatorGB = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS_GB);
  const set: InputSetter = (key) => (val) => setInputs((prev) => ({ ...prev, [key]: val }));
  const result = useMemo(() => calculate(inputs), [inputs]);
  const chartData = useMemo(() => buildChartData(inputs), [inputs]);
  const i18n = useI18n();
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    sendToMixpanel("Computed Buy vs Rent Outcome", {
      computeResult: result,
      currentInputs: inputs,
      source: "buy_vs_rent_calculator_gb",
    });
  }, [result]);

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
        </div>
      </div>
    </Card>
  );
};
