"use client";

import { useState } from "react";
import { useI18n } from "~/i18n/useI18n";
import { pccTax, pln } from "./formulas";
import type { CalculatorInputs, InputSetter } from "./types";
import { Input, Select } from "~/components/ui";
import { ThumbsUp, TriangleAlert } from "lucide-react";
import { safeFloat, safeInt } from "../utils/parse";
import { getLtvClass } from "../utils/helpers";
import { ControlsBar } from "../shared/ControlsBar";
import { Hint } from "../shared/Hint";

type InputsPanelProps = {
  readonly inputs: CalculatorInputs;
  readonly set: InputSetter;
  readonly showHints: boolean;
  readonly onToggleHints: () => void;
  readonly onFeedback?: () => void;
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

const BuyingInputs = ({ inputs, set, showHints, showAdvanced }: InternalInputProps & WithHints & WithAdvanced) => {
  const { propertyValue, deposit } = inputs;
  const ltv = propertyValue > 0 ? ((propertyValue - deposit) / propertyValue) * 100 : 0;
  const depositPct = 100 - ltv;
  // Polish LTV risk brackets: >80% LTV is high risk (most banks require mortgage insurance);
  // >90% typically blocked. Best rates at ≤80%; ≤60% is very safe territory.
  const ltvClass = getLtvClass(ltv, { risk: 80, normal: 60 });
  const i18n = useI18n();

  const noMortgage = deposit >= propertyValue;
  const belowMinDeposit = depositPct < 10 && !noMortgage; // absolute minimum is 10% (KNF recommendation)
  const belowIdealDeposit = depositPct >= 10 && depositPct < 20 && !noMortgage; // 20% = no ubezpieczenie niskiego wkładu

  const pccAmount = pccTax(propertyValue, inputs.isFirstTimeBuyer, inputs.isPrimaryMarket);
  const agentFee = propertyValue * (inputs.agentFeePct / 100);
  const totalAcquisitionCosts = pccAmount + agentFee + inputs.notaryCosts;
  const totalAcquisitionCostsPct = propertyValue > 0 ? (totalAcquisitionCosts / propertyValue) * 100 : 0;

  return (
    <>
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">{i18n("Buying")}</h2>

      {/* Row 1: Property value + Market type + FTB */}
      <div className="grid gap-x-4 gap-y-3 pb-2 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Input
            min={0}
            label={i18n("Property value (zł)")}
            step={5000}
            type="number"
            value={inputs.propertyValue}
            onChange={(e) => set("propertyValue")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "The agreed purchase price (cena zakupu). National avg ~10,000-14,000 zł/m² in major cities (Numbeo, 2026). Warsaw city centre: ~14,000-23,000 zł/m².",
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Select
            label={i18n("Market type")}
            value={inputs.isPrimaryMarket ? "primary" : "secondary"}
            onChange={(e) => set("isPrimaryMarket")(e.target.value === "primary")}
            options={[
              { label: i18n("Secondary market (rynek wtórny) - PCC applies"), value: "secondary" },
              { label: i18n("Primary market / Developer (rynek pierwotny) - VAT, no PCC"), value: "primary" },
            ]}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Primary market means buying from a developer (deweloper). The price includes 8% VAT (for flats ≤150 m²) and is exempt from PCC. Secondary market (resale) attracts 2% PCC unless you are a first-time buyer.",
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Select
            label={i18n("First-time buyer? (Pierwsze mieszkanie)")}
            value={inputs.isFirstTimeBuyer ? "yes" : "no"}
            onChange={(e) => set("isFirstTimeBuyer")(e.target.value === "yes")}
            options={[
              { label: i18n("No - standard PCC applies"), value: "no" },
              {
                label: i18n("Yes - exempt from PCC (Art. 9 pkt 17 u.p.c.c., since Aug 2023)"),
                value: "yes",
              },
            ]}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Since 31 August 2023, people who have NEVER owned any residential property are exempt from the 2% PCC on their first purchase. All co-buyers must qualify. Applies to secondary market only.",
            )}
          />
        </div>
      </div>

      {/* Row 2: Deposit */}
      <div className="grid gap-x-4 gap-y-3 pb-2 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            min={0}
            label={i18n("Down payment / Wkład własny (zł)")}
            step={5000}
            type="number"
            value={inputs.deposit}
            onChange={(e) => set("deposit")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Your own funds (wkład własny). KNF (Polish financial regulator) recommends minimum 20%. With 10-20%, most banks require mortgage insurance (ubezpieczenie niskiego wkładu własnego). Below 10% is rarely accepted.",
            )}
          />
        </div>

        {propertyValue > 0 && (
          <div className="flex flex-col justify-center gap-2">
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[0.8rem] font-semibold ${ltvClass}`}>
              {i18n("LTV {ltv}% · Wkład własny {deposit}%", {
                ltv: Math.max(0, ltv).toFixed(1),
                deposit: Math.min(100, depositPct).toFixed(1),
              })}
            </span>
            {belowMinDeposit && (
              <span className="text-danger flex items-center gap-1.5 text-sm font-medium">
                <TriangleAlert size={14} strokeWidth={3} />
                {i18n("Below 10% - most banks will not lend")}
              </span>
            )}
            {belowIdealDeposit && (
              <span className="text-warning flex items-center gap-1.5 text-sm font-medium">
                <TriangleAlert size={14} strokeWidth={3} />
                {i18n("Below 20% - ubezpieczenie niskiego wkładu likely required")}
              </span>
            )}
            {noMortgage && (
              <span className="text-primary flex items-center gap-1.5 text-sm font-medium">
                <ThumbsUp size={14} strokeWidth={3} />
                {i18n("No mortgage needed")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Mortgage rate + term + fixed/variable */}
      <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Input
            min={0}
            disabled={noMortgage}
            label={i18n("Mortgage rate (% p.a.)")}
            step={0.05}
            type="number"
            value={inputs.mortgageRate}
            onChange={(e) => set("mortgageRate")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Variable rate = WIBOR 3M (~4.5% in May 2026, after NBP cut to 3.75%) + bank margin (~2-2.5%) ≈ 6.5-7.0%. Fixed 5yr: ~6.5-7.5%. National average (Numbeo, May 2026): 6.87%. After the NBP rate cutting cycle completes, variable rates may fall to ~6%.",
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            min={5}
            max={35}
            disabled={noMortgage}
            label={i18n("Mortgage term (years)")}
            step={1}
            type="number"
            value={inputs.mortgageTerm}
            onChange={(e) => set("mortgageTerm")(safeInt(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Full repayment term. Typical in Poland: 25-35 years. Maximum allowed by KNF recommendation: 35 years. Longer terms reduce monthly payments but increase total interest paid.",
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Select
            label={i18n("Rate type")}
            value={inputs.isFixedRate ? "fixed" : "variable"}
            onChange={(e) => set("isFixedRate")(e.target.value === "fixed")}
            options={[
              { label: i18n("Variable (WIBOR + margin) - dominant in Poland"), value: "variable" },
              { label: i18n("Fixed rate (5yr, then variable)"), value: "fixed" },
            ]}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Variable-rate (zmienne oprocentowanie) is the dominant Polish product, linked to WIBOR 3M/6M. Fixed-rate (stałe oprocentowanie na 5 lat) is available and offers payment certainty for the fixed period, then reverts to variable.",
            )}
          />
        </div>
      </div>

      {/* Acquisition cost summary */}
      <div className="col-span-full mt-1 mb-4 flex flex-wrap items-center gap-4">
        {pccAmount > 0 && (
          <span className="text-neutral flex items-center gap-1.5 text-sm">
            {i18n("PCC tax")}:<strong className="text-on-surface font-semibold">{pln(pccAmount)}</strong>
            <span className="text-neutral/60 text-xs">(2%)</span>
          </span>
        )}
        {inputs.isFirstTimeBuyer && !inputs.isPrimaryMarket && (
          <span className="text-success flex items-center gap-1.5 text-sm font-medium">
            {i18n("PCC exempt - first-time buyer")}
          </span>
        )}
        {inputs.isPrimaryMarket && (
          <span className="text-primary flex items-center gap-1.5 text-sm font-medium">
            {i18n("PCC exempt - primary market (VAT included in price)")}
          </span>
        )}
        <span className="text-neutral flex items-center gap-1.5 text-sm">
          {i18n("Total acquisition costs")}:
          <strong className="text-on-surface font-semibold">
            ~{totalAcquisitionCostsPct.toFixed(1)}% {i18n("of purchase price")}
          </strong>
        </span>
      </div>

      {/* Advanced fields */}
      {showAdvanced && (
        <div className="bg-primary/10 mx-0 rounded-2xl px-4 py-4 md:-mx-4">
          {/* Row 4: Appreciation + Notary costs + Initial renovation */}
          <div className="grid gap-x-5 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Property appreciation (% p.a.)")}
                step={0.1}
                type="number"
                value={inputs.propertyAppreciation}
                onChange={(e) => set("propertyAppreciation")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Expected annual price growth. GUS data shows ~4% nationally in 2024-2025. Warsaw and Kraków historically average 5-8% p.a. Smaller cities: 3-5%.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Notary & court costs / Taksa notarialna (zł)")}
                step={100}
                type="number"
                value={inputs.notaryCosts}
                onChange={(e) => set("notaryCosts")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "All property sales in Poland must be notarised. Includes: taksa notarialna (sliding scale, max ~4,920 zł for 600k property), court fee for land register entry (wpis do KW, ~200 zł), and PCC on the notarial act (~23 zł). Typically 3,000-6,000 zł all-in.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Initial renovation / Stan deweloperski (zł)")}
                step={1000}
                type="number"
                value={inputs.initialRepairCosts}
                onChange={(e) => set("initialRepairCosts")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "New-build flats in Poland are typically sold in 'developer state' (stan deweloperski) - bare walls, no flooring, kitchen or bathroom. Full fit-out costs 1,000-2,500 zł/m². For a 60 m² flat expect 60,000-150,000 zł. Resale (rynek wtórny) is usually lower.",
                )}
              />
            </div>
          </div>

          {/* Row 5: Agent fee + Sale fees + Maintenance */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Buyer's agent fee / Prowizja pośrednika (%)")}
                step={0.1}
                type="number"
                value={inputs.agentFeePct}
                onChange={(e) => set("agentFeePct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "There is no law requiring equal splitting of commission. Buyer's commission is negotiable: typically 1.5-3% + VAT. Some agents are seller-only (prowizja tylko od sprzedającego); in that case set to 0%.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Selling costs at exit (% of sale price)")}
                step={0.1}
                type="number"
                value={inputs.saleFeesPct}
                onChange={(e) => set("saleFeesPct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "When you sell: agent commission (~2%) + notary for the sale contract (~0.5%). Total typically 2-3.5% of the sale price.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Annual maintenance (% of property value)")}
                step={0.1}
                type="number"
                value={inputs.maintenancePct}
                onChange={(e) => set("maintenancePct")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Ongoing upkeep costs inside your flat (appliances, internal repairs). Set separately from the czynsz administracyjny. Rule of thumb: 0.5-0.8% p.a. The wspólnota/spółdzielnia fundusz remontowy covers the building exterior and communal areas.",
                )}
              />
            </div>
          </div>

          {/* Row 6: Home insurance + Czynsz administracyjny + Property tax */}
          <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Home insurance / Ubezpieczenie mieszkania (zł/yr)")}
                step={50}
                type="number"
                value={inputs.annualHomeInsurance}
                onChange={(e) => set("annualHomeInsurance")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Private home insurance (contents, liability, fire etc.) - required by mortgage lender for structural cover. The building insurance is often included in czynsz administracyjny. Typically 400-1,000 zł/year.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Building admin fee / Czynsz administracyjny (zł/yr)")}
                step={100}
                type="number"
                value={inputs.annualBuildingAdminFee}
                onChange={(e) => set("annualBuildingAdminFee")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Monthly charges to your wspólnota mieszkaniowa or spółdzielnia: covers fundusz remontowy (mandatory building renovation fund), building insurance, common area maintenance, lift, cleaning, and administration. Typically 300-800 zł/month (3,600-9,600 zł/year). Houses set to 0.",
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Annual property tax / Podatek od nieruchomości (zł/yr)")}
                step={10}
                type="number"
                value={inputs.annualPropertyTax}
                onChange={(e) => set("annualPropertyTax")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Poland's property tax is area-based, not value-based. The maximum rate for 2025 is 1.19 zł/m²/year for residential property. For a 60 m² flat: ≤72 zł/year. The actual rate is set by your gmina (municipality) within the statutory maximum.",
                )}
              />
            </div>
          </div>

          {/* Row 7: Fixed-rate period + Refinancing cost (only for fixed-rate) */}
          {inputs.isFixedRate && (
            <div className="grid gap-x-4 gap-y-3 pb-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Input
                  min={1}
                  max={10}
                  disabled={noMortgage}
                  label={i18n("Fixed-rate period (years)")}
                  step={1}
                  type="number"
                  value={inputs.fixedRatePeriodYears}
                  onChange={(e) => set("fixedRatePeriodYears")(safeInt(e.target.value))}
                />
                <Hint
                  showHints={showHints}
                  text={i18n(
                    "Standard fixed period in Poland is 5 years (stałe oprocentowanie na 5 lat). After the fixed period, the loan reverts to WIBOR + margin. Some banks offer 7-10 year fixed products.",
                  )}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  disabled={noMortgage}
                  label={i18n("Refinancing cost (zł)")}
                  step={100}
                  type="number"
                  value={inputs.refinancingCost}
                  onChange={(e) => set("refinancingCost")(safeFloat(e.target.value))}
                />
                <Hint
                  showHints={showHints}
                  text={i18n(
                    "One-off cost when the fixed period ends and you negotiate a new rate or switch lender: bank processing fee (~0-500 zł) and mortgage hypothek amendment (zmiana hipoteki, ~200 PLN). Typically 500-1,000 zł.",
                  )}
                />
              </div>
            </div>
          )}
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
            label={i18n("Return on savings (% p.a.)")}
            step={0.1}
            type="number"
            value={inputs.returnOnSavings}
            onChange={(e) => set("returnOnSavings")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Annual return on capital kept by not buying (wkład własny, PCC, notary costs). Polish savings accounts (Konto Oszczędnościowe): ~5-6% in early 2026, expected to fall toward 4-4.5% as NBP cuts continue. Broad equity ETF: ~6-7% long-run.",
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label={i18n("Monthly rent / Czynsz najmu (zł)")}
            step={100}
            type="number"
            value={inputs.monthlyRent}
            onChange={(e) => set("monthlyRent")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Monthly rent (czynsz najmu), excluding utilities and building charges (opłaty eksploatacyjne). National average for a 1-bed flat: ~2,820 zł/month in major cities (Numbeo, May 2026). Warsaw 1-bed: 2,000-4,500 zł/month.",
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label={i18n("Expected rent increase (% p.a.)")}
            step={0.1}
            type="number"
            value={inputs.rentIncrease}
            onChange={(e) => set("rentIncrease")(safeFloat(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "Polish rents grew ~7% in 2024 and are easing toward ~4% in 2025-2026. Fixed-term tenancies can include a CPI indexation clause. There is no rent cap equivalent to the German Mietpreisbremse in Poland.",
            )}
          />
        </div>

        {showAdvanced && (
          <div className="bg-primary/10 mx-0 rounded-2xl px-4 py-4 md:-mx-4">
            <div className="flex flex-col gap-1">
              <Input
                label={i18n("Rental deposit / Kaucja (zł)")}
                step={100}
                type="number"
                value={inputs.rentalDeposit}
                onChange={(e) => set("rentalDeposit")(safeFloat(e.target.value))}
              />
              <Hint
                showHints={showHints}
                text={i18n(
                  "Under Art. 6 ustawy o ochronie praw lokatorów, the deposit (kaucja) is capped at 6 months' rent. Market norm: 2-3 months. The deposit is held directly by the landlord - there is no statutory third-party deposit protection scheme in Poland.",
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
      <h2 className="text-on-surface mb-2 text-xl font-semibold md:text-2xl">{i18n("Time horizon")}</h2>
      <div className="pb-4">
        <div className="flex flex-col gap-1">
          <Input
            label={i18n("Years in property")}
            step={1}
            min={1}
            max={50}
            type="number"
            value={inputs.years}
            onChange={(e) => set("years")(safeInt(e.target.value))}
          />
          <Hint
            showHints={showHints}
            text={i18n(
              "How long you plan to stay. Polish transaction costs (PCC, notary, agent, renovation) typically total 5-10% of the property value. Buying rarely makes financial sense for stays shorter than 5-7 years in most Polish cities.",
            )}
          />
        </div>
      </div>
    </>
  );
};

export default function InputsPanel({ inputs, set, showHints, onToggleHints, onFeedback }: InputsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <ControlsBar
        showHints={showHints}
        onToggleHints={onToggleHints}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced((v) => !v)}
        onFeedback={onFeedback}
      />
      <BuyingInputs inputs={inputs} set={set} showHints={showHints} showAdvanced={showAdvanced} />
      <RentingInputs inputs={inputs} set={set} showHints={showHints} showAdvanced={showAdvanced} />
      <LivingInputs inputs={inputs} set={set} showHints={showHints} />
    </>
  );
}
