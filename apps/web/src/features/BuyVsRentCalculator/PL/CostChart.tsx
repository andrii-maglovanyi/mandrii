"use client";

import SharedCostChart from "../shared/CostChart";
import { pln } from "./formulas";
import type { ChartDataPoint } from "../common";

type CostChartProps = {
  readonly data: readonly ChartDataPoint[];
  readonly years: number;
};

export default function CostChart({ data, years }: CostChartProps) {
  return <SharedCostChart data={data} years={years} formatCurrency={pln} currencySymbol="zł" />;
}
