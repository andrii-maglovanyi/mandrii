import { ChartDataPoint, RentingMetrics, SummaryMetrics } from "../../common";

/** User input parameters for the calculator */
export type CalculatorInputs = {
  readonly propertyValue: number;
  readonly deposit: number;
  readonly mortgageRate: number;
  readonly mortgageTerm: number;
  readonly firstTimeBuyer: boolean;
  readonly propertyAppreciation: number;
  readonly initialBuyingCosts: number;
  readonly initialRepairCosts: number;
  readonly saleFeesPct: number;
  readonly maintenancePct: number;
  readonly annualHomeInsurance: number;
  readonly mortgageArrangementFee: number;
  readonly remortgagingFrequencyYears: number;
  readonly averageRemortgagingCost: number;
  readonly serviceCharge: number;
  readonly groundRent: number;
  readonly returnOnSavings: number;
  readonly monthlyRent: number;
  readonly rentIncrease: number;
  readonly tenancyDeposit: number;
  readonly years: number;
};

// Composition types — not exported; use CalculationResult directly
type BuyingMetrics = {
  readonly deposit: number;
  readonly stampDuty: number;
  readonly totalMortgagePayments: number;
  readonly equity: number;
  readonly initialBuyingCosts: number;
  readonly maintenance: number;
  readonly totalInsurance: number;
  readonly sellingFees: number;
  readonly mortgageArrangementFee: number;
  readonly totalRemortgagingCosts: number;
  readonly totalServiceCharges: number;
  readonly totalGroundRent: number;
  readonly buyingNet: number;
  readonly monthlyMortgage: number;
};

/** Complete calculation result combining all buying, renting and summary metrics */
export type CalculationResult = BuyingMetrics & RentingMetrics & SummaryMetrics;

// Re-export common types for convenience
export type { ChartDataPoint, RentingMetrics, SummaryMetrics };

/** Curried setter for GB calculator inputs — set("key")(value) */
export type InputSetter = <K extends keyof CalculatorInputs>(key: K) => (value: CalculatorInputs[K]) => void;
