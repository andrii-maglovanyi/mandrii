// ── Mortgage helpers ──────────────────────────────────────────────────────────

import { pmt, remainingBalance } from "../utils/helpers";
import {
  fvLump,
  totalRentPaid,
  totalMaintenanceCosts,
  returnOnOngoingSavings,
  safe,
  type ChartDataPoint,
} from "../common";
import type { CalculationResult, CalculatorInputs, Bundesland } from "./types";

// ── Real Estate Transfer Tax ──────────────────────────────────────────────────

/**
 * Grunderwerbsteuer (GrESt) rates by Bundesland as of 2025.
 * A single source of truth used by both transferTax() and transferTaxRate().
 *
 * Changes vs. previous version:
 *   - Berlin moved from BE_HB_MV_NI_ST (5.5%) to BE_RP_TH (6.0%) — Berlin has
 *     been at 6.0% since 1 January 2014.
 *   - Bremen raised its rate from 5.0% to 5.5% on 1 July 2025 (Senate decree
 *     of 3 Dec 2024; Bremische Bürgerschaft resolution). Bremen now sits in
 *     HB_MV_NI_ST at 5.5% without Berlin.
 *   - The former BE_HB_MV_NI_ST group is therefore split into two:
 *       HB_MV_NI_ST  — Bremen, Mecklenburg-Vorpommern, Lower Saxony,
 *                       Saxony-Anhalt — 5.5%
 *       BE_RP_TH     — Berlin, Rhineland-Palatinate, Thuringia — 6.0%
 */
const TRANSFER_TAX_RATES: Record<Bundesland, number> = {
  BY_SN: 0.035, // Bavaria (Bayern) & Saxony (Sachsen)
  HH: 0.04, // Hamburg
  BW_HE: 0.05, // Baden-Württemberg & Hesse (Hessen)
  HB_MV_NI_ST: 0.055, // Bremen, Mecklenburg-Vorpommern, Lower Saxony, Saxony-Anhalt
  BE_RP_TH: 0.06, // Berlin, Rhineland-Palatinate (Rheinland-Pfalz), Thuringia (Thüringen)
  BB_NW_SH_SL: 0.065, // Brandenburg, North Rhine-Westphalia, Schleswig-Holstein, Saarland
};

/**
 * Grunderwerbsteuer (GrESt) — German Real Estate Transfer Tax
 * https://www.bundesfinanzministerium.de/
 *
 * Unlike UK Stamp Duty, GrESt is a flat percentage of the full purchase price
 * with NO threshold bands, NO first-time buyer relief, and NO exemptions for
 * residential buyers. The rate is set by each Bundesland independently.
 *
 * Rates as of July 2025:
 *   Bavaria (Bayern) & Saxony (Sachsen):                          3.5%
 *   Hamburg:                                                       4.0%
 *   Baden-Württemberg & Hesse (Hessen):                           5.0%
 *   Bremen, Mecklenburg-Vorpommern,
 *     Lower Saxony (Niedersachsen), Saxony-Anhalt (Sachsen-Anhalt): 5.5%
 *   Berlin, Rhineland-Palatinate (Rheinland-Pfalz),
 *     Thuringia (Thüringen):                                       6.0%
 *   Brandenburg, North Rhine-Westphalia (NRW),
 *     Schleswig-Holstein, Saarland:                               6.5%
 *
 * NOTE: Unlike the UK where the tax recurs in bands, GrESt = rate × full price.
 * There is no cliff-edge phenomenon equivalent to UK SDLT because there are no bands.
 */
export function transferTax(propertyValue: number, stateGroup: Bundesland): number {
  return propertyValue * (TRANSFER_TAX_RATES[stateGroup] ?? 0.05);
}

/** Return the transfer tax (Grunderwerbsteuer) rate (0–1) for a given state group (Bundesland) */
export function transferTaxRate(stateGroup: Bundesland): number {
  return TRANSFER_TAX_RATES[stateGroup] ?? 0.05;
}

// ── Summary calculation ───────────────────────────────────────────────────────

/**
 * Produces all figures shown in the results panel.
 *
 * Key German-specific differences vs. the UK version:
 *
 * 1. ACQUISITION COSTS (Kaufnebenkosten): Germany's upfront costs are
 *    significantly higher than the UK — typically 10–15% of the purchase price:
 *      • Grunderwerbsteuer (3.5–6.5%) — state-level transfer tax, no reliefs
 *      • Notary & Land Registry (Notar & Grundbuch): ~1.5–2% — mandatory for
 *        all property transfers; the notary certifies the contract (Kaufvertrag)
 *        and the entry in the land register (Grundbuch).
 *      • Maklerprovision (buyer's share): ~1.785–3.57% — since the
 *        Maklergesetz of December 2020 (§§ 656a–656d BGB), buyer and seller
 *        must split the commission equally. Only the buyer's half is modelled
 *        here as a buying cost.
 *
 * 2. FIXED-RATE PERIOD / REFINANCING (Zinsbindung / Anschlussfinanzierung):
 *    German mortgages fix the interest rate for a Zinsbindung period (typically
 *    10–15 years), not the full term. When the fixed period ends, the borrower
 *    must refinance at market rates (Anschlussfinanzierung). This model charges
 *    a one-off fee at each fixed-rate boundary within the holding period.
 *
 * 3. CONDO FEE / WEG (Hausgeld): Owners of Eigentumswohnungen (condominiums)
 *    pay a monthly Hausgeld to the Wohnungseigentümergemeinschaft (WEG) covering
 *    shared building maintenance, administration, and the Instandhaltungsrücklage
 *    (reserve fund). This is an annual fixed cost modelled separately from the
 *    general maintenance percentage.
 *
 * 4. PROPERTY TAX (Grundsteuer): Germany's annual property tax (reformed from
 *    January 2025), calculated as Grundsteuerwert × Steuermesszahl × municipal
 *    Hebesatz. The exact amount varies by municipality; users input it directly.
 *
 * 5. NO FIRST-TIME BUYER RELIEF: Unlike UK SDLT, German GrESt applies at the
 *    full flat rate on the full purchase price with no threshold or relief.
 *
 * 6. EQUITY: Calculated at end of the full holding period (years), consistent
 *    with expense calculations over the same period and with the PL version.
 *
 * 7. RENTAL DEPOSIT (Mietkaution): Legally capped at 3 months' cold rent
 *    (§551 BGB). The deposit is held in a separate account during the tenancy
 *    and returned on move-out, so it is excluded from the investable initial
 *    savings base but added back to rentingNet on exit.
 */
export function calculate(inputs: CalculatorInputs): CalculationResult {
  const propertyValue = safe(inputs.propertyValue);
  const deposit = safe(inputs.deposit);
  const mortgageRate = safe(inputs.mortgageRate);
  const mortgageTerm = safe(inputs.mortgageTerm, 1);
  const propertyAppreciation = safe(inputs.propertyAppreciation);
  const notaryAndLandRegistryCosts = safe(inputs.notaryAndLandRegistryCosts);
  const initialRepairCosts = safe(inputs.initialRepairCosts);
  const buyerAgentFeePct = safe(inputs.buyerAgentFeePct);
  const saleFeesPct = safe(inputs.saleFeesPct);
  const maintenancePct = safe(inputs.maintenancePct);
  const annualHomeInsurance = safe(inputs.annualHomeInsurance);
  const fixedRatePeriodYears = Math.max(1, safe(inputs.fixedRatePeriodYears, 10));
  const refinancingCost = safe(inputs.refinancingCost);
  const annualCondoFee = safe(inputs.annualCondoFee);
  const annualPropertyTax = safe(inputs.annualPropertyTax);
  const returnOnSavings = safe(inputs.returnOnSavings);
  const monthlyRent = safe(inputs.monthlyRent);
  const rentIncrease = safe(inputs.rentIncrease);
  const rentalDeposit = safe(inputs.rentalDeposit);
  const years = Math.max(1, safe(inputs.years, 1));
  const { stateGroup } = inputs;

  const loanAmount = Math.max(0, propertyValue - deposit);
  const monthlyMortgage = pmt(mortgageRate, mortgageTerm, loanAmount);
  const mortgagePayingYears = Math.min(years, mortgageTerm);
  const totalMortgagePayments = monthlyMortgage * 12 * mortgagePayingYears;

  const transferTaxAmount = transferTax(propertyValue, stateGroup);
  const buyerAgentFee = propertyValue * (buyerAgentFeePct / 100);

  // Refinancing (Anschlussfinanzierung) events: use (years − 1) so that selling
  // at exactly a fixed-rate boundary does not trigger a refinancing event.
  const refinancingEvents = Math.floor((years - 1) / fixedRatePeriodYears);
  const totalRefinancingCosts = refinancingEvents * refinancingCost;

  // Annual fixed ownership costs
  const totalCondoFees = annualCondoFee * years;
  const totalPropertyTax = annualPropertyTax * years;

  // Equity at end of full holding period (years of appreciation and mortgage paydown).
  // Using full `years` is consistent with expense calculations and the PL version.
  const equityYears = years;
  const futurePropertyValue = propertyValue * Math.pow(1 + propertyAppreciation / 100, equityYears);
  const balanceRemaining = remainingBalance(mortgageRate, mortgageTerm, loanAmount, equityYears * 12);
  const equity = futurePropertyValue - balanceRemaining;
  const sellingFees = futurePropertyValue * (saleFeesPct / 100);

  const maintenance = totalMaintenanceCosts(
    propertyValue,
    propertyAppreciation,
    maintenancePct,
    initialRepairCosts,
    years,
  );
  const totalInsurance = annualHomeInsurance * years;

  const buyingNet =
    -deposit -
    transferTaxAmount -
    buyerAgentFee -
    notaryAndLandRegistryCosts -
    totalMortgagePayments +
    equity -
    maintenance -
    totalInsurance -
    sellingFees -
    totalRefinancingCosts -
    totalCondoFees -
    totalPropertyTax;

  // ── Renting ───────────────────────────────────────────────────────────────

  // "Savings from not buying" shown in the UI (informational):
  // everything the renter does not spend at acquisition.
  const initialSavings =
    deposit + transferTaxAmount + buyerAgentFee + notaryAndLandRegistryCosts + initialRepairCosts + annualHomeInsurance;

  // Investment base: the capital that is actually available to invest.
  // Excludes rentalDeposit (Mietkaution — legally locked in deposit scheme, not investable).
  // Excludes the first year's insurance (that cost is incurred by the buyer
  // as an informational line only).
  const initialSavingsBase =
    deposit + transferTaxAmount + buyerAgentFee + notaryAndLandRegistryCosts + initialRepairCosts - rentalDeposit;

  const returnOnInitialSavings = fvLump(initialSavingsBase, returnOnSavings, years) - initialSavingsBase;
  const ongoingSavings = returnOnOngoingSavings(monthlyRent, rentIncrease, monthlyMortgage, returnOnSavings, years);
  const rentPaid = totalRentPaid(monthlyRent, rentIncrease, years);

  // Rental deposit (Mietkaution) is returned at end of tenancy — added back to net position.
  const rentingNet = returnOnInitialSavings + ongoingSavings - rentPaid + rentalDeposit;

  return {
    // Buying
    deposit,
    transferTaxAmount,
    buyerAgentFee,
    notaryAndLandRegistryCosts,
    totalMortgagePayments,
    equity,
    initialRepairCosts,
    maintenance,
    totalInsurance,
    sellingFees,
    totalRefinancingCosts,
    totalCondoFees,
    totalPropertyTax,
    buyingNet,
    monthlyMortgage,
    loanAmount,
    // Renting
    initialSavings,
    returnOnInitialSavings,
    ongoingSavings,
    rentPaid,
    rentingNet,
    // Summary
    years,
  };
}

// ── Chart data ────────────────────────────────────────────────────────────────

/**
 * Builds per-year series for the cost comparison chart.
 * Always computes at least 40 years (or userYears if longer) so the chart
 * can display any view range without recomputing.
 *
 * Buying = cumulative net cost of owning (positive = net spend, negative = net gain)
 * Renting = cumulative net cost of renting (positive = net spend, negative = net gain)
 */
export function buildChartData(inputs: CalculatorInputs): readonly ChartDataPoint[] {
  const propertyValue = safe(inputs.propertyValue);
  const deposit = safe(inputs.deposit);
  const mortgageRate = safe(inputs.mortgageRate);
  const mortgageTerm = safe(inputs.mortgageTerm, 1);
  const propertyAppreciation = safe(inputs.propertyAppreciation);
  const notaryAndLandRegistryCosts = safe(inputs.notaryAndLandRegistryCosts);
  const initialRepairCosts = safe(inputs.initialRepairCosts);
  const buyerAgentFeePct = safe(inputs.buyerAgentFeePct);
  const saleFeesPct = safe(inputs.saleFeesPct);
  const maintenancePct = safe(inputs.maintenancePct);
  const annualHomeInsurance = safe(inputs.annualHomeInsurance);
  const fixedRatePeriodYears = Math.max(1, safe(inputs.fixedRatePeriodYears, 10));
  const refinancingCost = safe(inputs.refinancingCost);
  const annualCondoFee = safe(inputs.annualCondoFee);
  const annualPropertyTax = safe(inputs.annualPropertyTax);
  const returnOnSavings = safe(inputs.returnOnSavings);
  const monthlyRent = safe(inputs.monthlyRent);
  const rentIncrease = safe(inputs.rentIncrease);
  const rentalDeposit = safe(inputs.rentalDeposit);
  const userYears = Math.max(1, safe(inputs.years, 1));
  const { stateGroup } = inputs;

  const loanAmount = Math.max(0, propertyValue - deposit);
  const monthlyMortgagePayment = pmt(mortgageRate, mortgageTerm, loanAmount);
  const annualMortgage = monthlyMortgagePayment * 12;
  const transferTaxAmount = transferTax(propertyValue, stateGroup);
  const buyerAgentFee = propertyValue * (buyerAgentFeePct / 100);

  // Upfront costs paid at acquisition
  const upfront = deposit + transferTaxAmount + buyerAgentFee + notaryAndLandRegistryCosts + initialRepairCosts;

  const MAX_YEARS = Math.max(40, userYears);
  const data: ChartDataPoint[] = [];

  // Renting state
  let cumRent = 0;
  let cumInvestmentProfit = 0;
  let ongoingBalance = 0;
  let ongoingDeposited = 0;
  let rent = monthlyRent;
  // Investment base: same as calculate() — excludes rentalDeposit (Mietkaution)
  let investmentBase =
    deposit + transferTaxAmount + buyerAgentFee + notaryAndLandRegistryCosts + initialRepairCosts - rentalDeposit;

  // Buying state
  let cumMortgage = 0;
  let cumMaint = 0;
  let cumRefinancing = 0;
  let propVal = propertyValue;

  for (let yr = 1; yr <= MAX_YEARS; yr++) {
    // ── Buying ──────────────────────────────────────────────────────────────
    // Use full yr (end-of-year) for equity — consistent with calculate() using equityYears = years.
    const pvN = propertyValue * Math.pow(1 + propertyAppreciation / 100, yr);
    const balN = remainingBalance(mortgageRate, mortgageTerm, loanAmount, yr * 12);
    const equityN = pvN - balN;
    const sellingFeesN = pvN * (saleFeesPct / 100);

    cumMortgage += yr - 1 < mortgageTerm ? annualMortgage : 0;
    cumMaint += propVal * (maintenancePct / 100);

    // Refinancing (Anschlussfinanzierung) fires at fixed-rate boundaries
    // (yr 11, 21, 31… for a 10-year fixed period), mirroring the (years−1)
    // logic in calculate().
    if (yr > 1 && (yr - 1) % fixedRatePeriodYears === 0) {
      cumRefinancing += refinancingCost;
    }

    const cumCondoFees = annualCondoFee * yr;
    const cumPropertyTax = annualPropertyTax * yr;

    const totalBuying =
      upfront +
      cumMortgage +
      cumMaint +
      annualHomeInsurance * yr +
      sellingFeesN -
      equityN +
      cumRefinancing +
      cumCondoFees +
      cumPropertyTax;

    // ── Renting ─────────────────────────────────────────────────────────────
    cumRent += rent * 12;
    const annualProfit = investmentBase * (returnOnSavings / 100);
    cumInvestmentProfit += annualProfit;
    investmentBase += annualProfit;

    const surplus = Math.max(0, (monthlyMortgagePayment - rent) * 12);
    ongoingBalance = (ongoingBalance + surplus) * (1 + returnOnSavings / 100);
    ongoingDeposited += surplus;

    // Rental deposit (Mietkaution) returned at user's chosen move-out year
    const depositReturn = yr === userYears ? rentalDeposit : 0;

    const totalRenting = cumRent - cumInvestmentProfit - (ongoingBalance - ongoingDeposited) - depositReturn;

    data.push({
      year: yr,
      buying: Math.round(totalBuying),
      renting: Math.round(totalRenting),
    });

    rent *= 1 + rentIncrease / 100;
    propVal *= 1 + propertyAppreciation / 100;
  }

  return data;
}

// ── Formatting ────────────────────────────────────────────────────────────────

/**
 * Formats a number as EUR currency using German locale conventions.
 * Negative sign is applied manually after formatting the absolute value
 * for consistent placement regardless of locale sign conventions.
 */
export function eur(value: number) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `-${formatted}` : formatted;
}

/**
 * Returns a human-readable label for a state group (Bundesland) option.
 * Used in the InputsPanel dropdown and UI display.
 */
export function stateGroupLabel(stateGroup: Bundesland): string {
  const labels: Record<Bundesland, string> = {
    BY_SN: "Bavaria & Saxony — 3.5%",
    HH: "Hamburg — 4.0%",
    BW_HE: "Baden-Württemberg & Hesse — 5.0%",
    HB_MV_NI_ST: "Bremen, Meck.-Vorpommern, Lower Saxony, Saxony-Anhalt — 5.5%",
    BE_RP_TH: "Berlin, Rhineland-Palatinate & Thuringia — 6.0%",
    BB_NW_SH_SL: "Brandenburg, NRW, Schleswig-Holstein, Saarland — 6.5%",
  };
  return labels[stateGroup];
}

// German state group options (Bundesländer) for the transfer tax rate selector
export const STATE_GROUP_OPTIONS: Bundesland[] = ["BY_SN", "HH", "BW_HE", "HB_MV_NI_ST", "BE_RP_TH", "BB_NW_SH_SL"];
