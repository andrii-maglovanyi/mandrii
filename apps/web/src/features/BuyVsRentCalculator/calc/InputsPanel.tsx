import { useState } from "react";
import { useI18n } from "~/i18n/useI18n";
import { stampDuty, gbp } from "./formulas";
import type { CalculatorInputs, InputSetter } from "./types";
import { Checkbox, Input } from "~/components/ui";
import { ThumbsUp, TriangleAlert, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { safeFloat, safeInt } from "./parse";

type InputsPanelProps = {
  readonly inputs: CalculatorInputs;
  readonly set: InputSetter;
  readonly showHints: boolean;
  readonly onToggleHints: () => void;
};

type InternalInputProps = {
  readonly inputs: CalculatorInputs;
  readonly set: InputSetter;
};

type WithHints = {
  readonly showHints: boolean;
};

type WithAdvanced = {
  readonly showAdvanced: boolean;
};

function getLtvClass(ltv: number): string {
  if (ltv > 95) return "bg-red-50 text-red-700";
  if (ltv > 80) return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

/** Renders a hint paragraph only when showHints is true */
function Hint({ text, showHints }: { text: string; showHints: boolean }) {
  if (!showHints) return null;
  return <span className="text-neutral/80 text-xs">{text}</span>;
}

const BuyingInputs = ({ inputs, set, showHints, showAdvanced }: InternalInputProps & WithHints & WithAdvanced) => {
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

      {/* Row 1: Property value + Deposit */}
      <div className="grid gap-x-4 gap-y-3 pb-2 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            min={0}
            label={i18n("Property value (£)")}
            step={1000}
            type="number"
            value={inputs.propertyValue}
            onChange={(e) => set("propertyValue")(safeFloat(e.target.value))}
          />
          <Hint showHints={showHints} text={i18n("The total price of the property you plan to buy.")} />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            min={0}
            label={i18n("Deposit (£)")}
            step={1000}
            type="number"
            value={inputs.deposit}
            onChange={(e) => set("deposit")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "The amount of your own funds (deposit) that you pay upfront. The remainder is covered by the mortgage.",
            )}
          />
        </div>

        {propertyValue > 0 && (
          <div className="col-span-full mt-1 flex w-full">
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[0.8rem] font-semibold ${ltvClass}`}
              >
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

      {/* Row 2: Mortgage rate + term + FTB */}
      <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Input
            min={0}
            disabled={noMortgage}
            label={i18n("Mortgage rate (%)")}
            step={0.01}
            type="number"
            value={inputs.mortgageRate}
            onChange={(e) => set("mortgageRate")(safeFloat(e.target.value))}
          />
          <Hint showHints={showHints} text={i18n("The interest rate charged by the bank for the mortgage.")} />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            min={1}
            disabled={noMortgage}
            label={i18n("Mortgage term (years)")}
            step={1}
            type="number"
            value={inputs.mortgageTerm}
            onChange={(e) => set("mortgageTerm")(safeInt(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n("The period over which you must repay the loan to the bank in full (usually 25–35 years).")}
          />
        </div>

        {/* FTB: no top offset on mobile (mt-8 only on md+) */}
        <div className="flex flex-col gap-1 md:mt-8">
          <Checkbox
            checked={inputs.firstTimeBuyer}
            label={i18n("First time buyer?")}
            onChange={() => set("firstTimeBuyer")(!inputs.firstTimeBuyer)}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "A special status for those buying property for the first time. Ticking this box automatically applies preferential Stamp Duty rates.",
            )}
          />
        </div>

        <div className="col-span-full mt-1 flex w-full">
          <span className="text-neutral flex items-center gap-1.5 text-sm">
            {i18n("Stamp duty")}:<strong className="text-on-surface font-semibold">{gbp(sd)}</strong>
          </span>
        </div>
      </div>

      {/* Advanced fields */}
      {showAdvanced && (
        <div className="bg-primary/10 -mx-4 rounded-2xl p-4">
          {/* Row 3: Appreciation + Buying costs + Repair costs */}
          <div className="grid gap-x-5 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Property appreciation (%)")}
                step={0.1}
                type="number"
                value={inputs.propertyAppreciation}
                onChange={(e) => set("propertyAppreciation")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "A forecast of the percentage by which your property's market value is expected to increase each year.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Initial buying costs (£)")}
                step={100}
                type="number"
                value={inputs.initialBuyingCosts}
                onChange={(e) => set("initialBuyingCosts")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n("One-off associated costs, e.g. legal fees, property valuation, and paperwork.")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Initial repair costs (£)")}
                step={100}
                type="number"
                value={inputs.initialRepairCosts}
                onChange={(e) => set("initialRepairCosts")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n("The amount you plan to spend on renovations immediately after purchase.")}
              />
            </div>
          </div>

          {/* Row 4: Sale fees + Maintenance + Insurance */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Sale fees (%)")}
                step={0.1}
                type="number"
                value={inputs.saleFeesPct}
                onChange={(e) => set("saleFeesPct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n("The percentage of the property's value paid to the estate agent when you sell.")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Annual maintenance (%)")}
                step={0.1}
                type="number"
                value={inputs.maintenancePct}
                onChange={(e) => set("maintenancePct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Estimated annual costs for routine repairs and upkeep, calculated as a percentage of the property's total value.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Annual home insurance (£)")}
                step={100}
                type="number"
                value={inputs.annualHomeInsurance}
                onChange={(e) => set("annualHomeInsurance")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "The cost of your buildings insurance policy, usually a mandatory requirement for a mortgage.",
                )}
              />
            </div>
          </div>

          {/* Row 5: UK-specific mortgage costs */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Mortgage arrangement fee (£)")}
                step={100}
                type="number"
                value={inputs.mortgageArrangementFee}
                onChange={(e) => set("mortgageArrangementFee")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n("One-time upfront fee charged by the bank to set up the mortgage.")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Remortgage frequency (years)")}
                step={1}
                min={2}
                max={35}
                type="number"
                value={inputs.remortgagingFrequencyYears}
                onChange={(e) => set("remortgagingFrequencyYears")(safeInt(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n("How often (in years) you expect to switch to a new mortgage deal.")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Average remortgage cost (£)")}
                step={100}
                type="number"
                value={inputs.averageRemortgagingCost}
                onChange={(e) => set("averageRemortgagingCost")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n("Total cost per remortgage event, including broker and bank fees.")}
              />
            </div>
          </div>

          {/* Row 6: Leasehold-specific costs */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Annual service charge (£)")}
                step={100}
                type="number"
                value={inputs.serviceCharge}
                onChange={(e) => set("serviceCharge")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "For leasehold properties: covers maintenance, cleaning, and repairs of shared areas such as lifts and lobbies.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Annual ground rent (£)")}
                step={100}
                type="number"
                value={inputs.groundRent}
                onChange={(e) => set("groundRent")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "For leasehold properties: annual payment to the freeholder. Note: ground rent was banned on new residential leases from 30 April 2022 — this only applies if you are buying an existing pre-2022 lease.",
                )}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RentingInputs = ({ inputs, set, showHints, showAdvanced }: InternalInputProps & WithHints & WithAdvanced) => {
  const i18n = useI18n();

  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">{i18n("Renting")}</h2>
      <div className="grid gap-x-8 gap-y-3 pb-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            label={i18n("Return on savings (%)")}
            step={0.1}
            type="number"
            value={inputs.returnOnSavings}
            onChange={(e) => set("returnOnSavings")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "The annual percentage return you could earn by investing all the capital saved by not buying (deposit, stamp duty, buying costs, repairs, and arrangement fee).",
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label={i18n("Monthly rent (£)")}
            step={100}
            type="number"
            value={inputs.monthlyRent}
            onChange={(e) => set("monthlyRent")(safeFloat(e.target.value))}
          />
          <Hint showHints={showHints} text={i18n("Your current or expected monthly rent payment.")} />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <Input
            label={i18n("Expected rent increase (%)")}
            step={0.1}
            type="number"
            value={inputs.rentIncrease}
            onChange={(e) => set("rentIncrease")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "The annual percentage by which you expect your rent to rise over time. Under the Renters' Rights Act 2025, landlords can only raise rent once per year, to market rate.",
            )}
          />
        </div>

        {showAdvanced && (
          <div className="bg-primary/10 -mx-4 rounded-2xl p-4">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Tenancy deposit (£)")}
                step={100}
                type="number"
                value={inputs.tenancyDeposit}
                onChange={(e) => set("tenancyDeposit")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Typically 5 weeks of rent, held in a deposit scheme. This capital is unavailable for investment until you move out.",
                )}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const LivingInputs = ({ inputs, set, showHints }: InternalInputProps & WithHints) => {
  const i18n = useI18n();

  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">{i18n("Living")}</h2>
      <div className="pb-4">
        <div className="flex flex-col gap-1">
          <Input
            label={i18n("Years in property")}
            step={1}
            min={1}
            max={40}
            type="number"
            value={inputs.years}
            onChange={(e) => set("years")(safeInt(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "How long you plan to stay in the property. Longer horizons tend to favour buying; shorter ones often favour renting.",
            )}
          />
        </div>
      </div>
    </>
  );
};

/** Toggle button strip — hints on the left, advanced on the right */
function ControlsBar({
  showHints,
  onToggleHints,
  showAdvanced,
  onToggleAdvanced,
}: {
  showHints: boolean;
  onToggleHints: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}) {
  const i18n = useI18n();

  const pillClass = (active: boolean) =>
    [
      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-primary text-primary bg-primary/10 hover:bg-primary/20"
        : "border-neutral/30 text-neutral hover:border-neutral/60",
    ].join(" ");

  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2 md:justify-end">
      <button type="button" onClick={onToggleHints} className={pillClass(showHints)} aria-pressed={showHints}>
        <HelpCircle size={14} strokeWidth={2.5} />
        {showHints ? i18n("Hide hints") : i18n("Show hints")}
      </button>

      <button type="button" onClick={onToggleAdvanced} className={pillClass(showAdvanced)} aria-pressed={showAdvanced}>
        {showAdvanced ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
        {showAdvanced ? i18n("Fewer options") : i18n("More options")}
      </button>
    </div>
  );
}

export default function InputsPanel({ inputs, set, showHints, onToggleHints }: InputsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <ControlsBar
        showHints={showHints}
        onToggleHints={onToggleHints}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced((v) => !v)}
      />
      <BuyingInputs inputs={inputs} set={set} showHints={showHints} showAdvanced={showAdvanced} />
      <RentingInputs inputs={inputs} set={set} showHints={showHints} showAdvanced={showAdvanced} />
      <LivingInputs inputs={inputs} set={set} showHints={showHints} />
    </>
  );
}
