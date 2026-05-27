import type { CalculatorInputs } from "./types";

/**
 * Default inputs for the German calculator.
 *
 * NOTE: These defaults represent an illustrative scenario for a major German city
 * (Berlin-style urban condo). They are NOT national German averages.
 * - propertyValue: 400,000 - plausible for a mid-range Berlin/Hamburg/Munich flat
 * - monthlyRent: 1,500 - plausible for a Berlin 1-2 bed (Kaltmiete, excl. Nebenkosten)
 * - mortgageRate: 3.6% - indicative 10yr Zinsbindung (2025; verify current market rates)
 * - stateGroup: "BE_HB_MV_NI_ST" - Berlin (5.5% Grunderwerbsteuer); change for other states
 * - buyerAgentFeePct: 3.57% - legally split 50/50 (Käufer/Verkäufer) since Dec 2020
 * - returnOnSavings: 3.5% - indicative Tagesgeld/ETF rate; varies by product
 * Users should adjust these to their own location and circumstances.
 */
export const DEFAULT_INPUTS_DE: CalculatorInputs = {
  propertyValue: 400_000,
  deposit: 80_000,
  mortgageRate: 3.6,
  mortgageTerm: 30,
  stateGroup: "HB_MV_NI_ST", // Berlin (5.5% Grunderwerbsteuer)
  propertyAppreciation: 3.0,
  notaryAndLandRegistryCosts: 8_000,
  initialRepairCosts: 4_000,
  buyerAgentFeePct: 3.57,
  saleFeesPct: 3.57, // seller pays their half of the standard 7.14% Maklerprovision
  maintenancePct: 0.8,
  annualHomeInsurance: 400,
  fixedRatePeriodYears: 10,
  refinancingCost: 400,
  annualCondoFee: 2_400,
  annualPropertyTax: 600,
  returnOnSavings: 3.5,
  monthlyRent: 1_500,
  rentIncrease: 3.0,
  rentalDeposit: Math.round(1_500 * 3),
  years: 10,
};
