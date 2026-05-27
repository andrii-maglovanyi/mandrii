"use client";

import SharedCostChart from "../shared/CostChart";
import { gbp } from "./formulas";
import type { ChartDataPoint } from "./types";

type CostChartProps = {
  readonly data: readonly ChartDataPoint[];
  readonly years: number;
};

export default function CostChart({ data, years }: CostChartProps) {
  return <SharedCostChart data={data} years={years} formatCurrency={gbp} currencySymbol="£" />;
}
