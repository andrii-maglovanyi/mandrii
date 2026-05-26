/**
 * Shared utilities for BuyVsRentCalculator
 * Used by both GB and DE calculators
 */

export { fvLump, totalRentPaid, totalMaintenanceCosts, returnOnOngoingSavings, safe } from "./formulas-shared";
export type { ChartDataPoint, RentingMetrics, SummaryMetrics, InputSetter } from "./types-shared";
