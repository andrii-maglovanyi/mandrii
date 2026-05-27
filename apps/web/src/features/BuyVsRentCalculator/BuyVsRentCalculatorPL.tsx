"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Home } from "lucide-react";
import { Card, Separator } from "~/components/ui";
import { calculate, buildChartData } from "./PL/formulas";
import InputsPanel from "./PL/InputsPanel";
import ResultsPanel from "./PL/ResultsPanel";
import CostChart from "./PL/CostChart";
import { Glossary } from "./PL/Glossary";
import { FeedbackModal } from "./FeedbackModal";
import { DEFAULT_INPUTS_PL } from "./PL/defaults";
import type { CalculatorInputs, InputSetter } from "./PL/types";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { PolishFlag } from "~/components/ui/HeroFlag/PolishFlag";

export { DEFAULT_INPUTS_PL } from "./PL/defaults";

export const BuyVsRentCalculatorPL = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS_PL);
  const set: InputSetter = (key) => (val) => setInputs((prev) => ({ ...prev, [key]: val }));
  const result = useMemo(() => calculate(inputs), [inputs]);
  const chartData = useMemo(() => buildChartData(inputs), [inputs]);
  const i18n = useI18n();
  const [showHints, setShowHints] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      sendToMixpanel("Computed Buy vs Rent Outcome", {
        computeResult: result,
        currentInputs: inputs,
        source: "buy_vs_rent_calculator_pl",
      });
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  return (
    <Card
      className={`md:border-primary md:bg-surface mx-auto h-max overflow-hidden rounded-3xl md:border-2 md:shadow-xl`}
    >
      <div className={`relative z-10 overflow-hidden rounded-3xl px-2 py-6 sm:py-9 md:rounded-none md:px-8 md:py-12`}>
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <PolishFlag
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

        <div className={`z-50 flex items-start gap-3 md:py-2 lg:py-6`}>
          <div
            className={`bg-primary text-surface flex min-h-12 min-w-12 items-center justify-center rounded-2xl shadow-md`}
          >
            <Home className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h1 className={`text-on-surface text-xl font-bold md:text-2xl lg:text-3xl`}>
              {i18n("Polish Buy vs Rent Calculator")}
            </h1>
            <p className="text-neutral max-w-4xl">
              {i18n("Compare buying and renting scenarios based on your Polish property details")}
            </p>
          </div>
        </div>
      </div>

      <div className={`space-y-6 pt-4 md:px-12 md:py-8`}>
        <InputsPanel
          inputs={inputs}
          set={set}
          showHints={showHints}
          onToggleHints={() => setShowHints((v) => !v)}
          onFeedback={() => setShowFeedbackModal(true)}
        />

        <Separator align="center" text={i18n("Results ↓")} variant="full" />

        <ResultsPanel result={result} showHints={showHints}>
          <CostChart data={chartData} years={inputs.years} />
        </ResultsPanel>

        <div className="py-5">
          <p className="text-neutral mb-4 font-semibold uppercase">{i18n("Glossary")}</p>
          <Glossary />
        </div>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        featureName={i18n("Polish Buy vs Rent Calculator")}
      />
    </Card>
  );
};
