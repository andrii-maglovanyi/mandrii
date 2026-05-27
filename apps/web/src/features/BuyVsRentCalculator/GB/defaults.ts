import type { CalculatorInputs } from "./types";

/**
 * Default inputs for the GB calculator.
 *
 * NOTE: These defaults represent an illustrative scenario for a higher-value
 * urban market (e.g. London / South East). They are NOT national UK averages.
 * - propertyValue: 500,000 — typical London/South East flat or starter home
 * - monthlyRent: 2,200 — in line with London outer-borough rents (not UK-typical)
 * - mortgageRate: 4.5% — indicative 2yr/5yr fixed rate (mid-2025; verify current rates)
 * - returnOnSavings: 4.0% — indicative cash ISA / easy-access rate; varies by product
 * Users should adjust these to their own circumstances.
 */
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
