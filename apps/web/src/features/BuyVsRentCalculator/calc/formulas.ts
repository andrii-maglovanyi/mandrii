// ── Mortgage helpers ──────────────────────────────────────────────────────────

import type { CalculationResult, ChartDataPoint, CalculatorInputs } from "./types";

/** Monthly PMT (fixed-rate mortgage payment) */
export function pmt(annualRate: number, termYears: number, principal: number) {
  if (principal <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Remaining mortgage balance after `paymentsMade` months */
export function remainingBalance(annualRate: number, termYears: number, principal: number, paymentsMade: number) {
  if (principal <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal * (1 - paymentsMade / (termYears * 12));
  return (
    principal * Math.pow(1 + r, paymentsMade) -
    pmt(annualRate, termYears, principal) * ((Math.pow(1 + r, paymentsMade) - 1) / r)
  );
}

// ── Stamp Duty ────────────────────────────────────────────────────────────────

/**
 * UK Stamp Duty Land Tax (SDLT) — rates from April 2025
 * https://www.gov.uk/stamp-duty-land-tax/residential-property-rates
 *
 * Standard rates:
 *   0%  on first £125,000
 *   2%  on £125,001–£250,000
 *   5%  on £250,001–£925,000
 *   10% on £925,001–£1,500,000
 *   12% above £1,500,000
 *
 * First-time buyer relief:
 *   0%  up to £300,000
 *   5%  on £300,001–£500,000
 *   No relief above £500,000 — standard rates apply
 *
 * NOTE: FTB relief is a government program designed to help buyers afford homes
 * up to £500k. Above £500k, the property is deemed outside the assistance bracket,
 * so standard rates apply. For a £500,001 property, this results in ~£15,000 SDLT
 * (roughly 3%), as standard rates use tiered bands starting from 0%.
 */
export function stampDuty(propertyValue: number, firstTimeBuyer: boolean) {
  const v = propertyValue;

  if (firstTimeBuyer && v <= 500_000) {
    if (v <= 300_000) return 0;
    return (v - 300_000) * 0.05;
  }

  let tax = 0;
  const bands = [
    [125_000, 0.0],
    [125_000, 0.02],
    [675_000, 0.05],
    [575_000, 0.1],
    [Infinity, 0.12],
  ];
  let remaining = v;
  for (const [size, rate] of bands) {
    const taxable = Math.min(remaining, size);
    tax += taxable * rate;
    remaining -= taxable;
    if (remaining <= 0) break;
  }
  return tax;
}

// ── Core calculations ─────────────────────────────────────────────────────────

/** Future value of a lump sum invested at annual rate for n years */
function fvLump(pv: number, annualRate: number, years: number) {
  return pv * Math.pow(1 + annualRate / 100, years);
}

/** Total rent paid over N years with annual increases */
function totalRentPaid(monthlyRent: number, annualIncrease: number, years: number) {
  let total = 0;
  let rent = monthlyRent;
  for (let y = 0; y < years; y++) {
    total += rent * 12;
    rent *= 1 + annualIncrease / 100;
  }
  return total;
}

/**
 * Repairs & maintenance = initialRepairCosts + maintenancePct% * SUM(propertyValue each year)
 * Matches spreadsheet: -(E12 + E14 * SUM(Parameters!C year 1..N))
 */
function totalMaintenanceCosts(
  propertyValue: number,
  annualAppreciation: number,
  maintenancePct: number,
  initialRepairCosts: number,
  years: number,
) {
  let total = 0;
  let val = propertyValue;
  for (let y = 0; y < years; y++) {
    total += val * (maintenancePct / 100);
    val *= 1 + annualAppreciation / 100;
  }
  return total + initialRepairCosts;
}

/**
 * Cumulative return on ongoing savings — matches Parameters col S.
 *
 * Models the case where the renter invests the annual surplus (mortgage - rent)
 * at the start of each year, compounding at the savings rate.
 *
 * NOTE: This only captures surplus when mortgage > rent. If rent exceeds the
 * mortgage payment, that extra rent cost is already reflected as a higher
 * `rentPaid` figure in the renting total — the model does not additionally
 * credit the buyer for a "surplus" in that scenario, keeping both sides
 * comparable. This matches the original spreadsheet behaviour.
 *
 * Returns only the investment gain (balance minus total deposited).
 */
function returnOnOngoingSavings(
  monthlyRent: number,
  annualRentIncrease: number,
  monthlyMortgage: number,
  annualSavingsRate: number,
  years: number,
) {
  const annualRate = annualSavingsRate / 100;
  let balance = 0;
  let totalDeposited = 0;
  let rent = monthlyRent;
  for (let y = 0; y < years; y++) {
    const annualSurplus = Math.max(0, (monthlyMortgage - rent) * 12);
    balance = (balance + annualSurplus) * (1 + annualRate);
    totalDeposited += annualSurplus;
    rent *= 1 + annualRentIncrease / 100;
  }
  return balance - totalDeposited;
}

// ── Summary calculation ───────────────────────────────────────────────────────

/**
 * Produces all figures shown in the results panel.
 * Formulas match the original spreadsheet exactly.
 *
 * NOTE: equity is calculated at `years - 1` (matching spreadsheet XLOOKUP(C23-1, ...)),
 * reflecting the property value and remaining mortgage at the start of the final year
 * rather than the end. This means a 10-year plan uses 9 years of appreciation and
 * mortgage paydown — consistent with the spreadsheet but worth bearing in mind.
 */
export function calculate(inputs: CalculatorInputs): CalculationResult {
  const safe = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);

  const propertyValue = safe(inputs.propertyValue);
  const deposit = safe(inputs.deposit, 0);
  const mortgageRate = safe(inputs.mortgageRate, 0);
  const mortgageTerm = safe(inputs.mortgageTerm, 1);
  const propertyAppreciation = safe(inputs.propertyAppreciation, 0);
  const initialBuyingCosts = safe(inputs.initialBuyingCosts, 0);
  const initialRepairCosts = safe(inputs.initialRepairCosts, 0);
  const saleFeesPct = safe(inputs.saleFeesPct, 0);
  const maintenancePct = safe(inputs.maintenancePct, 0);
  const annualHomeInsurance = safe(inputs.annualHomeInsurance, 0);
  const mortgageArrangementFee = safe(inputs.mortgageArrangementFee, 0);
  const remortgagingFrequencyYears = Math.max(1, safe(inputs.remortgagingFrequencyYears, 5));
  const averageRemortgagingCost = safe(inputs.averageRemortgagingCost, 0);
  const serviceCharge = safe(inputs.serviceCharge, 0);
  const groundRent = safe(inputs.groundRent, 0);
  const returnOnSavings = safe(inputs.returnOnSavings, 0);
  const monthlyRent = safe(inputs.monthlyRent, 0);
  const rentIncrease = safe(inputs.rentIncrease, 0);
  const tenancyDeposit = safe(inputs.tenancyDeposit, 0);
  const years = Math.max(1, safe(inputs.years, 1));
  const { firstTimeBuyer } = inputs;

  const loanAmount = Math.max(0, propertyValue - deposit);
  const monthlyMortgage = pmt(mortgageRate, mortgageTerm, loanAmount);
  const mortgagePayingYears = Math.min(years, mortgageTerm);
  const totalMortgagePayments = monthlyMortgage * 12 * mortgagePayingYears;
  const sd = stampDuty(propertyValue, firstTimeBuyer);

  // Remortgaging costs: how many times will you remortgage?
  // Use (years - 1) so that selling at exactly a deal boundary (e.g. year 5 on a
  // 5-year fix) doesn't count a remortgage — you wouldn't switch deals just to sell.
  // This is consistent with the chart, which fires remortgaging at yr = freq+1, 2*freq+1...
  const remortgagingEvents = Math.floor((years - 1) / remortgagingFrequencyYears);
  const totalRemortgagingCosts = remortgagingEvents * averageRemortgagingCost;

  // Leasehold costs: service charge + ground rent paid annually
  const totalServiceCharges = serviceCharge * years;
  const totalGroundRent = groundRent * years;

  // Uses years-1 to match spreadsheet XLOOKUP(C23-1, ...) — equity is
  // calculated at the start of the final year, not end, to reflect
  // the point-in-time value when you'd sell.
  const equityYears = years - 1;
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
    sd -
    totalMortgagePayments +
    equity -
    initialBuyingCosts -
    maintenance -
    totalInsurance -
    sellingFees -
    mortgageArrangementFee -
    totalRemortgagingCosts -
    totalServiceCharges -
    totalGroundRent;

  // Renting
  // "Savings from not buying" = deposit + SD + buying costs + repair costs + 1yr insurance
  // Note: tenancyDeposit is NOT included in initial savings since it's not actually spent, just frozen
  const initialSavings = deposit + sd + initialBuyingCosts + initialRepairCosts + annualHomeInsurance;
  // Investment base excludes home insurance (matches col K in spreadsheet)
  // Also excludes tenancyDeposit since it's frozen in a deposit scheme and not available for investment
  const initialSavingsBase = deposit + sd + initialBuyingCosts + initialRepairCosts - tenancyDeposit;
  const returnOnInitialSavings = fvLump(initialSavingsBase, returnOnSavings, years) - initialSavingsBase;
  const ongoingSavings = returnOnOngoingSavings(monthlyRent, rentIncrease, monthlyMortgage, returnOnSavings, years);
  const rentPaid = totalRentPaid(monthlyRent, rentIncrease, years);
  // Net = SUM(K27:K29) in spreadsheet — initialSavings is informational only
  // Note: tenancyDeposit is returned at end of tenancy, so it's added back to rentingNet
  const rentingNet = returnOnInitialSavings + ongoingSavings - rentPaid + tenancyDeposit;

  return {
    // Buying
    deposit,
    stampDuty: sd,
    totalMortgagePayments,
    equity,
    initialBuyingCosts,
    maintenance,
    totalInsurance,
    sellingFees,
    mortgageArrangementFee,
    totalRemortgagingCosts,
    totalServiceCharges,
    totalGroundRent,
    buyingNet,
    monthlyMortgage,
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
 * Builds per-year series for the cost chart.
 * Buying = col I, Renting = col N from the Parameters sheet.
 * Always computes 40 years so the chart can show any view range.
 */
export function buildChartData(inputs: CalculatorInputs): readonly ChartDataPoint[] {
  const safe = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);

  const propertyValue = safe(inputs.propertyValue);
  const deposit = safe(inputs.deposit, 0);
  const mortgageRate = safe(inputs.mortgageRate, 0);
  const mortgageTerm = safe(inputs.mortgageTerm, 1);
  const propertyAppreciation = safe(inputs.propertyAppreciation, 0);
  const initialBuyingCosts = safe(inputs.initialBuyingCosts, 0);
  const initialRepairCosts = safe(inputs.initialRepairCosts, 0);
  const saleFeesPct = safe(inputs.saleFeesPct, 0);
  const maintenancePct = safe(inputs.maintenancePct, 0);
  const annualHomeInsurance = safe(inputs.annualHomeInsurance, 0);
  const mortgageArrangementFee = safe(inputs.mortgageArrangementFee, 0);
  const remortgagingFrequencyYears = Math.max(1, safe(inputs.remortgagingFrequencyYears, 5));
  const averageRemortgagingCost = safe(inputs.averageRemortgagingCost, 0);
  const serviceCharge = safe(inputs.serviceCharge, 0);
  const groundRent = safe(inputs.groundRent, 0);
  const returnOnSavings = safe(inputs.returnOnSavings, 0);
  const monthlyRent = safe(inputs.monthlyRent, 0);
  const rentIncrease = safe(inputs.rentIncrease, 0);
  const tenancyDeposit = safe(inputs.tenancyDeposit, 0);
  const userYears = Math.max(1, safe(inputs.years, 1));
  const { firstTimeBuyer } = inputs;

  const loanAmount = Math.max(0, propertyValue - deposit);
  // Computed once — reused for surplus calculation inside the loop
  const monthlyMortgagePayment = pmt(mortgageRate, mortgageTerm, loanAmount);
  const annualMortgage = monthlyMortgagePayment * 12;
  const sd = stampDuty(propertyValue, firstTimeBuyer);
  // Upfront costs for buying
  const upfront = deposit + sd + initialBuyingCosts + initialRepairCosts + mortgageArrangementFee;

  const MAX_YEARS = Math.max(40, userYears);
  const data: ChartDataPoint[] = [];

  // Renting state
  let cumRent = 0;
  let cumInvestmentProfit = 0;
  let ongoingBalance = 0;
  let ongoingDeposited = 0;
  let rent = monthlyRent;
  // Investment base matches calculate()'s initialSavingsBase (col K in spreadsheet):
  // deposit + SD + buying costs + repairs — excludes mortgageArrangementFee and tenancyDeposit.
  let investmentBase = deposit + sd + initialBuyingCosts + initialRepairCosts - tenancyDeposit;

  // Buying state
  let cumMortgage = 0;
  let cumMaint = 0;
  let cumRemortgagingCosts = 0;
  let propVal = propertyValue;

  for (let yr = 1; yr <= MAX_YEARS; yr++) {
    // Buying (col I)
    const pvN = propertyValue * Math.pow(1 + propertyAppreciation / 100, yr - 1);
    const balN = remainingBalance(mortgageRate, mortgageTerm, loanAmount, (yr - 1) * 12);
    const equityN = pvN - balN;
    const sellingFeesN = pvN * (saleFeesPct / 100);
    // yr - 1 < mortgageTerm: mortgage payments only accrue while within the term.
    // At yr=1 we add year 1's payments (yr-1=0 < term), stopping once the term ends.
    cumMortgage += yr - 1 < mortgageTerm ? annualMortgage : 0;
    cumMaint += propVal * (maintenancePct / 100);

    // Remortgaging costs: add when it's time to remortgage (every remortgagingFrequencyYears)
    if (yr > 1 && (yr - 1) % remortgagingFrequencyYears === 0) {
      cumRemortgagingCosts += averageRemortgagingCost;
    }

    // Leasehold costs: service charge + ground rent (annual)
    const cumServiceCharges = serviceCharge * yr;
    const cumGroundRent = groundRent * yr;

    const totalBuying =
      upfront +
      cumMortgage +
      cumMaint +
      annualHomeInsurance * yr +
      sellingFeesN -
      equityN +
      cumRemortgagingCosts +
      cumServiceCharges +
      cumGroundRent;

    // Renting (col N)
    cumRent += rent * 12;
    const annualProfit = investmentBase * (returnOnSavings / 100);
    cumInvestmentProfit += annualProfit;
    investmentBase += annualProfit;
    // Reuse monthlyMortgagePayment — same value as pmt(...) would return
    const surplus = Math.max(0, (monthlyMortgagePayment - rent) * 12);
    ongoingBalance = (ongoingBalance + surplus) * (1 + returnOnSavings / 100);
    ongoingDeposited += surplus;

    // Tenancy deposit is returned at the user's chosen move-out year, reducing
    // the net cost of renting. Subtract it (deposit return = benefit to renter).
    const depositReturn = yr === userYears ? tenancyDeposit : 0;

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
 * Formats a number as GBP currency.
 * Negative sign is applied manually after formatting the absolute value
 * to ensure consistent placement regardless of locale sign conventions.
 */
export function gbp(value: number) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `-${formatted}` : formatted;
}
