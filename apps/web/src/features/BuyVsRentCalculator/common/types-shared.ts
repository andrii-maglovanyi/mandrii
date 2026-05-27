/**
 * Shared types used by both GB and DE calculators.
 * Country-specific types (CalculatorInputs, BuyingMetrics) are defined in each calculator's types.ts.
 */

/** Single data point for the year-by-year cost comparison chart */
export type ChartDataPoint = {
  readonly year: number;
  readonly buying: number;
  readonly renting: number;
};

/** Renting-related calculation metrics - common structure across both calculators */
export type RentingMetrics = {
  readonly initialSavings: number;
  readonly returnOnInitialSavings: number;
  readonly ongoingSavings: number;
  readonly rentPaid: number;
  readonly rentingNet: number;
};

/** Summary metrics - common structure across both calculators */
export type SummaryMetrics = {
  readonly years: number;
};

/** Curried setter for a single input field - set("key")(value) */
export type InputSetter<T> = <K extends keyof T>(key: K) => (value: T[K]) => void;
