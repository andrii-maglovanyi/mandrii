import { ChartDataPoint, RentingMetrics, SummaryMetrics } from "../common";

/** User input parameters for the German calculator */
export type CalculatorInputs = {
  readonly propertyValue: number;
  readonly deposit: number;
  readonly mortgageRate: number;
  readonly mortgageTerm: number;
  readonly stateGroup: Bundesland;
  readonly propertyAppreciation: number;
  readonly notaryAndLandRegistryCosts: number;
  readonly initialRepairCosts: number;
  readonly buyerAgentFeePct: number;
  readonly saleFeesPct: number;
  readonly maintenancePct: number;
  readonly annualHomeInsurance: number;
  readonly fixedRatePeriodYears: number;
  readonly refinancingCost: number;
  readonly annualCondoFee: number;
  readonly annualPropertyTax: number;
  readonly returnOnSavings: number;
  readonly monthlyRent: number;
  readonly rentIncrease: number;
  readonly rentalDeposit: number;
  readonly years: number;
};

/**
 * Bundesland (German federal state group) determines the Grunderwerbsteuer
 * (property transfer tax) rate. Rates as of 2025 - set by each state independently.
 */
export type Bundesland =
  | "BY_SN" // Bavaria & Saxony:                                              3.5%
  | "HH" // Hamburg:                                                       4.0%
  | "BW_HE" // Baden-Württemberg & Hesse:                                     5.0%
  | "HB_MV_NI_ST" // Bremen, Mecklenburg-Vorpommern, Lower Saxony, Saxony-Anhalt: 5.5%
  | "BE_RP_TH" // Berlin, Rhineland-Palatinate & Thuringia:                              6.0%
  | "BB_NW_SH_SL"; // Brandenburg, NRW, Schleswig-Holstein, Saarland:               6.5%

// Composition types - not exported; use CalculationResult directly
type BuyingMetrics = {
  readonly deposit: number;
  readonly transferTaxAmount: number; // Grunderwerbsteuer
  readonly buyerAgentFee: number; // Maklerprovision (buyer's share)
  readonly notaryAndLandRegistryCosts: number;
  readonly totalMortgagePayments: number;
  readonly equity: number;
  readonly initialRepairCosts: number;
  readonly maintenance: number;
  readonly totalInsurance: number;
  readonly sellingFees: number;
  readonly totalRefinancingCosts: number; // Anschlussfinanzierung
  readonly totalCondoFees: number; // Hausgeld
  readonly totalPropertyTax: number; // Grundsteuer
  readonly buyingNet: number;
  readonly monthlyMortgage: number;
  readonly loanAmount: number;
};

/** Complete calculation result combining all buying, renting and summary metrics */
export type CalculationResult = BuyingMetrics & RentingMetrics & SummaryMetrics;

// Re-export common types for convenience
export type { ChartDataPoint, RentingMetrics, SummaryMetrics };

/** Curried setter for German calculator inputs - set("key")(value) */
export type InputSetter = <K extends keyof CalculatorInputs>(key: K) => (value: CalculatorInputs[K]) => void;
