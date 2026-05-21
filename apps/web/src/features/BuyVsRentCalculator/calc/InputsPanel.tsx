import { useI18n } from "~/i18n/useI18n";
import { stampDuty, gbp } from "./formulas";
import type { CalculatorInputs, InputSetter } from "./types";
import { Checkbox, Input } from "~/components/ui";
import { ThumbsUp, TriangleAlert } from "lucide-react";
import { safeFloat, safeInt } from "./parse";

type InputsPanelProps = {
  readonly inputs: CalculatorInputs;
  readonly set: InputSetter;
};

function getLtvClass(ltv: number): string {
  if (ltv > 95) return "ltv-danger";
  if (ltv > 80) return "ltv-warn";
  return "ltv-ok";
}

type InfoSlotProps = {
  readonly children: React.ReactNode;
};

const BuyingInputs = ({ inputs, set }: InputsPanelProps) => {
  const { propertyValue, deposit, firstTimeBuyer } = inputs;
  const ltv = propertyValue > 0 ? ((propertyValue - deposit) / propertyValue) * 100 : 0;
  const depositPct = 100 - ltv;
  const i18n = useI18n();

  const sd = stampDuty(propertyValue, firstTimeBuyer);
  const ltvClass = getLtvClass(ltv);

  const noMortgage = deposit >= propertyValue;
  const belowMinDeposit = depositPct < 5 && !noMortgage;

  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">{i18n("Buying")}</h2>

      <div className="grid gap-x-4 pb-1 md:grid-cols-2">
        <Input
          min={0}
          label={i18n("Property value (£)")}
          step={1000}
          type="number"
          value={inputs.propertyValue}
          onChange={(e) => set("propertyValue")(safeFloat(e.target.value))}
        />
        <Input
          min={0}
          label={i18n("Deposit (£)")}
          step={1000}
          type="number"
          value={inputs.deposit}
          onChange={(e) => set("deposit")(safeFloat(e.target.value))}
        />

        {propertyValue > 0 && (
          <div className="col-span-full mt-2 flex w-full">
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <span className={`ltv-badge ${ltvClass}`}>
                {i18n("LTV {ltv}% · Deposit {deposit}%", {
                  ltv: Math.max(0, ltv).toFixed(1),
                  deposit: Math.min(100, depositPct).toFixed(1),
                })}
              </span>
              {belowMinDeposit && (
                <span className="text-danger flex items-center gap-1.5 text-sm font-medium">
                  <TriangleAlert size={14} strokeWidth={3} />
                  {i18n("Below 5% min deposit")}
                </span>
              )}
              {noMortgage && (
                <span className="text-primary flex items-center gap-1.5 text-sm font-medium">
                  <ThumbsUp size={14} strokeWidth={3} />
                  {i18n("No mortgage needed")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-x-4 pb-2 md:grid-cols-3">
        <Input
          min={0}
          disabled={noMortgage}
          label={i18n("Mortgage rate (%)")}
          step={0.01}
          type="number"
          value={inputs.mortgageRate}
          onChange={(e) => set("mortgageRate")(safeFloat(e.target.value))}
        />
        <Input
          min={1}
          disabled={noMortgage}
          label={i18n("Mortgage term (years)")}
          step={1}
          type="number"
          value={inputs.mortgageTerm}
          onChange={(e) => set("mortgageTerm")(safeInt(e.target.value))}
        />

        <div className="mt-8">
          <Checkbox
            checked={inputs.firstTimeBuyer}
            label={i18n("First time buyer?")}
            onChange={() => set("firstTimeBuyer")(!inputs.firstTimeBuyer)}
          />
        </div>

        <div className="col-span-full mt-2 flex w-full">
          <span className="text-neutral flex items-center gap-1.5 text-sm">
            {i18n("Stamp duty")}:<strong className="text-on-surface font-semibold">{gbp(sd)}</strong>
          </span>
        </div>
      </div>

      {/* Row 3: Appreciation + Buying costs + Repair costs */}
      <div className="grid gap-x-5 pb-6 md:grid-cols-3">
        <Input
          label={i18n("Property appreciation (%)")}
          step={0.1}
          type="number"
          value={inputs.propertyAppreciation}
          onChange={(e) => set("propertyAppreciation")(safeFloat(e.target.value))}
        />
        <Input
          label={i18n("Initial buying costs (£)")}
          step={100}
          type="number"
          value={inputs.initialBuyingCosts}
          onChange={(e) => set("initialBuyingCosts")(safeFloat(e.target.value))}
        />
        <Input
          label={i18n("Initial repair costs (£)")}
          step={100}
          type="number"
          value={inputs.initialRepairCosts}
          onChange={(e) => set("initialRepairCosts")(safeFloat(e.target.value))}
        />
      </div>

      {/* Row 4: Sale fees + Maintenance + Insurance */}
      <div className="grid gap-x-4 pb-6 md:grid-cols-3">
        <Input
          label={i18n("Sale fees (%)")}
          step={0.1}
          type="number"
          value={inputs.saleFeesPct}
          onChange={(e) => set("saleFeesPct")(safeFloat(e.target.value))}
        />
        <Input
          label={i18n("Annual maintenance (%)")}
          step={0.1}
          type="number"
          value={inputs.maintenancePct}
          onChange={(e) => set("maintenancePct")(safeFloat(e.target.value))}
        />
        <Input
          label={i18n("Annual home insurance (£)")}
          step={100}
          type="number"
          value={inputs.annualHomeInsurance}
          onChange={(e) => set("annualHomeInsurance")(safeFloat(e.target.value))}
        />
      </div>
    </>
  );
};

const RentingInputs = ({ inputs, set }: InputsPanelProps) => {
  const i18n = useI18n();

  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">{i18n("Renting")}</h2>
      <div className="grid gap-4 pb-4 md:grid-cols-3">
        <Input
          label={i18n("Return on savings (%)")}
          step={0.1}
          type="number"
          value={inputs.returnOnSavings}
          onChange={(e) => set("returnOnSavings")(safeFloat(e.target.value))}
        />
        <Input
          label={i18n("Monthly rent (£)")}
          step={100}
          type="number"
          value={inputs.monthlyRent}
          onChange={(e) => set("monthlyRent")(safeFloat(e.target.value))}
        />
        <Input
          label={i18n("Expected rent increase (%)")}
          step={0.1}
          type="number"
          value={inputs.rentIncrease}
          onChange={(e) => set("rentIncrease")(safeFloat(e.target.value))}
        />
      </div>
    </>
  );
};

const LivingInputs = ({ inputs, set }: InputsPanelProps) => {
  const i18n = useI18n();

  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">{i18n("Living")}</h2>
      <div className="grid gap-x-4 pb-6 md:grid-cols-3">
        <Input
          label={i18n("Years in property")}
          step={1}
          type="number"
          value={inputs.years}
          onChange={(e) => set("years")(safeInt(e.target.value))}
        />
      </div>
    </>
  );
};

export default function InputsPanel({ inputs, set }: InputsPanelProps) {
  return (
    <>
      <BuyingInputs inputs={inputs} set={set} />
      <RentingInputs inputs={inputs} set={set} />
      <LivingInputs inputs={inputs} set={set} />
    </>
  );
}
