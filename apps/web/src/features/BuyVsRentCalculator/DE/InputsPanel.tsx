"use client";

import { useState } from "react";
import { transferTax, eur, stateGroupLabel, STATE_GROUP_OPTIONS } from "./formulas";
import type { Bundesland, CalculatorInputs, InputSetter } from "./types";
import { Checkbox, Input, Select } from "~/components/ui";
import { ThumbsUp, TriangleAlert, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { safeFloat, safeInt } from "../utils/parse";
import { getLtvClass } from "../utils/helpers";

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

/** Renders a hint paragraph only when showHints is true */
function Hint({ text, showHints }: { text: string; showHints: boolean }) {
  if (!showHints) return null;
  return <span className="text-neutral/80 text-xs">{text}</span>;
}

const BuyingInputs = ({ inputs, set, showHints, showAdvanced }: InternalInputProps & WithHints & WithAdvanced) => {
  const { propertyValue, deposit, stateGroup } = inputs;
  const ltv = propertyValue > 0 ? ((propertyValue - deposit) / propertyValue) * 100 : 0;
  const depositPct = 100 - ltv;
  const ltvClass = getLtvClass(ltv, { risk: 80, normal: 60 });

  // Transfer tax (Grunderwerbsteuer) and acquisition cost summary
  const transferTaxAmount = transferTax(propertyValue, stateGroup);
  const transferTaxRate = transferTaxAmount / propertyValue;
  const buyerAgentFee = propertyValue * (inputs.buyerAgentFeePct / 100);
  const totalAcquisitionCosts = transferTaxAmount + buyerAgentFee + inputs.notaryAndLandRegistryCosts;
  const totalAcquisitionCostsPct = propertyValue > 0 ? (totalAcquisitionCosts / propertyValue) * 100 : 0;

  const noMortgage = deposit >= propertyValue;
  const belowMinDeposit = depositPct < 20 && !noMortgage;

  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">Buying</h2>

      {/* Row 1: Property value + Deposit */}
      <div className="grid gap-x-4 gap-y-3 pb-2 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            min={0}
            label="Property value (€)"
            step={5000}
            type="number"
            value={inputs.propertyValue}
            onChange={(e) => set("propertyValue")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="The total purchase price of the property as stated in the notarial sales contract (Kaufvertrag)."
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            min={0}
            label="Equity / Down payment (€)"
            step={5000}
            type="number"
            value={inputs.deposit}
            onChange={(e) => set("deposit")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="Your own funds (Eigenkapital). German banks typically require at least the full Kaufnebenkosten (10–15%) plus 10–20% of the purchase price from your own capital."
          />
        </div>

        {propertyValue > 0 && (
          <div className="col-span-full mt-1 flex w-full">
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[0.8rem] font-semibold ${ltvClass}`}
              >
                {`LTV (Beleihungsauslauf) ${Math.max(0, ltv).toFixed(1)}% · Equity ${Math.min(100, depositPct).toFixed(1)}%`}
              </span>
              {belowMinDeposit && (
                <span className="text-danger flex items-center gap-1.5 text-sm font-medium">
                  <TriangleAlert size={14} strokeWidth={3} />
                  Below 20% equity — expect rate surcharges
                </span>
              )}
              {ltv > 60 && ltv <= 80 && !belowMinDeposit && (
                <span className="text-warning flex items-center gap-1.5 text-sm font-medium">
                  <TriangleAlert size={14} strokeWidth={3} />
                  Above 60% LTV — moderate rate band
                </span>
              )}
              {noMortgage && (
                <span className="text-primary flex items-center gap-1.5 text-sm font-medium">
                  <ThumbsUp size={14} strokeWidth={3} />
                  No mortgage needed
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Mortgage rate + term + State group (Bundesland) */}
      <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Input
            min={0}
            disabled={noMortgage}
            label="Mortgage rate / Sollzins (%)"
            step={0.05}
            type="number"
            value={inputs.mortgageRate}
            onChange={(e) => set("mortgageRate")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="The annual nominal interest rate (Sollzinssatz) on your loan. 10-year fixed rates (Zinsbindung) are currently around 3.3–3.7% in Germany (Dr. Klein / Bundesbank, 2025–2026)."
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            min={5}
            max={40}
            disabled={noMortgage}
            label="Mortgage term / Gesamtlaufzeit (years)"
            step={1}
            type="number"
            value={inputs.mortgageTerm}
            onChange={(e) => set("mortgageTerm")(safeInt(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="Full repayment term until the loan is paid off (Volltilgung). Typically 25–35 years in Germany."
          />
        </div>

        <div className="flex flex-col gap-1">
          {/* Federal state (Bundesland) — determines the transfer tax rate */}
          <Select
            label="Federal state / Bundesland"
            value={inputs.stateGroup}
            onChange={(e) => set("stateGroup")(e.target.value as Bundesland)}
            options={STATE_GROUP_OPTIONS.map((sg) => ({
              label: stateGroupLabel(sg),
              value: sg,
            }))}
          />
          <Hint
            showHints={showHints}
            text="Determines the Grunderwerbsteuer rate. Unlike UK Stamp Duty, GrESt is a flat percentage of the full purchase price with no thresholds and no first-time buyer relief."
          />
        </div>

        {/* Acquisition costs (Kaufnebenkosten) summary row */}
        <div className="col-span-full mt-1 flex flex-wrap items-center gap-4">
          <span className="text-neutral flex items-center gap-1.5 text-sm">
            Transfer tax (GrESt):
            <strong className="text-on-surface font-semibold">{eur(transferTaxAmount)}</strong>
            <span className="text-neutral/60 text-xs">({(transferTaxRate * 100).toFixed(1)}%)</span>
          </span>
          <span className="text-neutral flex items-center gap-1.5 text-sm">
            Total acquisition costs (Kaufnebenkosten):
            <strong className="text-on-surface font-semibold">
              ~{totalAcquisitionCostsPct.toFixed(1)}% of purchase price
            </strong>
          </span>
        </div>
      </div>

      {/* Advanced fields */}
      {showAdvanced && (
        <div className="bg-primary/10 -mx-4 rounded-2xl p-4">
          {/* Row 3: Appreciation + Notary costs + Repair costs */}
          <div className="grid gap-x-5 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label="Property appreciation (% p.a.)"
                step={0.1}
                type="number"
                value={inputs.propertyAppreciation}
                onChange={(e) => set("propertyAppreciation")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Expected annual price growth. Destatis reported +3.2% nationally in 2025. Major cities (Munich, Frankfurt, Hamburg) have historically averaged 3–5% p.a."
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Notary & land registry costs (€)"
                step={500}
                type="number"
                value={inputs.notaryAndLandRegistryCosts}
                onChange={(e) => set("notaryAndLandRegistryCosts")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Mandatory in Germany: the notary (Notar) certifies the purchase contract and the land registry (Grundbuch) records ownership. Together ~1.5–2% of the purchase price."
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Initial renovation costs (€)"
                step={500}
                type="number"
                value={inputs.initialRepairCosts}
                onChange={(e) => set("initialRepairCosts")(safeFloat(e.target.value))}
              />
              <Hint showHints={showHints} text="One-off renovation or fitting-out costs immediately after purchase." />
            </div>
          </div>

          {/* Row 4: Buyer agent fee + Sale fees + Maintenance */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label="Buyer's agent fee / Maklerprovision (%)"
                step={0.01}
                type="number"
                value={inputs.buyerAgentFeePct}
                onChange={(e) => set("buyerAgentFeePct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Since the Maklergesetz of December 2020 (§§ 656a–656d BGB), buyer and seller must share the agent's commission equally. The total commission is typically 3.57–7.14% (incl. VAT); the buyer pays half. Enter only the buyer's share here (typically 1.785–3.57%)."
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Selling costs at exit (% of sale price)"
                step={0.1}
                type="number"
                value={inputs.saleFeesPct}
                onChange={(e) => set("saleFeesPct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Costs when you eventually sell: notary, land registry update, and any agent commission on the sale. Typically 2–4% of the sale price."
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Annual maintenance (% of property value)"
                step={0.1}
                type="number"
                value={inputs.maintenancePct}
                onChange={(e) => set("maintenancePct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Annual upkeep costs as a % of property value, growing with appreciation. Rule of thumb: 0.5–1% for Neubau (new-build), up to 1.5% for Altbau (pre-war stock)."
              />
            </div>
          </div>

          {/* Row 5: Insurance + Fixed-rate period + Refinancing cost */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label="Buildings insurance / Wohngebäudeversicherung (€/yr)"
                step={50}
                type="number"
                value={inputs.annualHomeInsurance}
                onChange={(e) => set("annualHomeInsurance")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Annual buildings insurance premium, required by lenders. For condominiums (Eigentumswohnungen), this is often included in the Hausgeld — adjust accordingly."
              />
            </div>

            <div className="flex flex-col gap-1">
              {/* Fixed-rate period (Zinsbindung) */}
              <Input
                min={5}
                max={30}
                disabled={noMortgage}
                label="Fixed-rate period / Zinsbindung (years)"
                step={1}
                type="number"
                value={inputs.fixedRatePeriodYears}
                onChange={(e) => set("fixedRatePeriodYears")(safeInt(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Unlike UK mortgages, German mortgages fix the rate only for the Zinsbindung period (typically 10–15 years), not the full term. When this expires, you must arrange Anschlussfinanzierung at whatever rates prevail at that time."
              />
            </div>

            <div className="flex flex-col gap-1">
              {/* Refinancing cost (Anschlussfinanzierung) */}
              <Input
                disabled={noMortgage}
                label="Refinancing cost / Anschlussfinanzierung (€)"
                step={100}
                type="number"
                value={inputs.refinancingCost}
                onChange={(e) => set("refinancingCost")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="One-off cost each time you arrange a new fixed-rate deal: broker fee, notarial land charge amendment (Grundschuldänderung), and any bank processing fees. Typically €500–€2,000."
              />
            </div>
          </div>

          {/* Row 6: Condo fee (Hausgeld) + Property tax (Grundsteuer) */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              {/* Annual condo fee (Hausgeld / WEG) */}
              <Input
                label="Annual condo fee / Hausgeld (€)"
                step={100}
                type="number"
                value={inputs.annualCondoFee}
                onChange={(e) => set("annualCondoFee")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="For Eigentumswohnungen (condominiums): annual Hausgeld paid to the Wohnungseigentümergemeinschaft (WEG), covering shared building maintenance, administration, and the Instandhaltungsrücklage (reserve fund). Typically €24–€48/m²/year. Set to 0 for houses."
              />
            </div>

            <div className="flex flex-col gap-1">
              {/* Annual property tax (Grundsteuer) */}
              <Input
                label="Annual property tax / Grundsteuer (€)"
                step={50}
                type="number"
                value={inputs.annualPropertyTax}
                onChange={(e) => set("annualPropertyTax")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Annual municipal property tax, reformed from January 2025. Calculated as Grundsteuerwert × Steuermesszahl × local Hebesatz. Typically €400–€1,500/year depending on municipality and property size."
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RentingInputs = ({ inputs, set, showHints, showAdvanced }: InternalInputProps & WithHints & WithAdvanced) => {
  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">Renting</h2>
      <div className="grid gap-x-8 gap-y-3 pb-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            label="Return on savings (% p.a.)"
            step={0.1}
            type="number"
            value={inputs.returnOnSavings}
            onChange={(e) => set("returnOnSavings")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="Annual return on the capital you keep by not buying (equity, GrESt, Kaufnebenkosten). German Tagesgeld (instant-access savings): ~3–3.5%; broad equity ETF (long-run): ~5–7%. Defaults to 3.5%."
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label="Monthly cold rent / Kaltmiete (€)"
            step={50}
            type="number"
            value={inputs.monthlyRent}
            onChange={(e) => set("monthlyRent")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="Monthly rent excluding utilities and service charges (Kaltmiete). The Mietpreisbremse (§556d BGB) limits new tenancy rents to 10% above the local reference rent (Mietspiegel) in designated tight-market areas."
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label="Expected rent increase (% p.a.)"
            step={0.1}
            type="number"
            value={inputs.rentIncrease}
            onChange={(e) => set("rentIncrease")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="The Kappungsgrenze (§558 BGB) caps increases in existing tenancies at 20% over 3 years (15% in areas with an angespannter Wohnungsmarkt). Destatis reported ~3.5% annual rent growth in 2025. New tenancy rents are additionally restricted by the Mietpreisbremse."
          />
        </div>

        {showAdvanced && (
          <div className="bg-primary/10 -mx-4 rounded-2xl p-4">
            <div className="flex flex-col gap-1">
              {/* Rental deposit (Mietkaution) */}
              <Input
                label="Rental deposit / Mietkaution (€)"
                step={100}
                type="number"
                value={inputs.rentalDeposit}
                onChange={(e) => set("rentalDeposit")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text="Legally capped at 3 months' cold rent (§551 BGB). The deposit is held in a separate account (Mietkautionskonto) and returned on move-out. This capital cannot be invested during the tenancy."
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const LivingInputs = ({ inputs, set, showHints }: InternalInputProps & WithHints) => {
  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">Time horizon</h2>
      <div className="pb-4">
        <div className="flex flex-col gap-1">
          <Input
            label="Years in property"
            step={1}
            min={1}
            max={50}
            type="number"
            value={inputs.years}
            onChange={(e) => set("years")(safeInt(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text="How long you plan to stay. Because German Kaufnebenkosten are very high (typically 10–15% of the purchase price), buying rarely makes financial sense for stays shorter than 7–10 years."
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
        {showHints ? "Hide hints" : "Show hints"}
      </button>

      <button type="button" onClick={onToggleAdvanced} className={pillClass(showAdvanced)} aria-pressed={showAdvanced}>
        {showAdvanced ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
        {showAdvanced ? "Fewer options" : "More options"}
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
