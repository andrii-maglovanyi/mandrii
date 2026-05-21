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
  readonly returnOnSavings: number;
  readonly monthlyRent: number;
  readonly rentIncrease: number;
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
  readonly buyingNet: number;
  readonly monthlyMortgage: number;
};

type RentingMetrics = {
  readonly initialSavings: number;
  readonly returnOnInitialSavings: number;
  readonly ongoingSavings: number;
  readonly rentPaid: number;
  readonly rentingNet: number;
};

type SummaryMetrics = {
  readonly difference: number;
  readonly years: number;
};

/** Complete calculation result combining all buying, renting and summary metrics */
export type CalculationResult = BuyingMetrics & RentingMetrics & SummaryMetrics;

/** Single data point for the year-by-year cost comparison chart */
export type ChartDataPoint = {
  readonly year: number;
  readonly buying: number;
  readonly renting: number;
};

/** Curried setter for a single input field — set("key")(value) */
export type InputSetter = <K extends keyof CalculatorInputs>(key: K) => (value: CalculatorInputs[K]) => void;
