"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { eur } from "./formulas";
import type { ChartDataPoint } from "../common";
import { useI18n } from "~/i18n/useI18n";

type ChartTooltipProps = {
  readonly active?: boolean;
  readonly payload?: Array<{ name: string; value: number; color: string }>;
  readonly label?: number;
};

const BUYING_COLOR = "var(--color-primary)";
const RENTING_COLOR = "var(--color-success, #10b981)";
const DEFAULT_VIEW_OPTIONS = [10, 20, 30, 40];

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const i18n = useI18n();

  if (!active || !payload?.length) return null;

  return (
    <div className="bg-on-surface min-w-[200px] rounded-lg px-3.5 py-2.5 shadow-xl">
      <div className="text-surface/60 mb-1.5 text-[0.78rem] font-bold tracking-wide uppercase">
        {i18n("Year {label}", { label: label ?? 0 })}
      </div>
      {payload.map(({ name, value, color }) => (
        <div key={name} className="mb-1 flex items-center gap-1.5 text-[0.82rem]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
          <span className="text-surface/80 flex-1">{name}</span>
          <span className="font-bold tabular-nums" style={{ color }}>
            {eur(value)}
            {value < 0 && <span className="ml-0.5 text-[0.7rem] opacity-80">({i18n("in profit")})</span>}
          </span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="border-surface/20 text-surface/60 mt-1.5 border-t pt-1.5 text-[0.75rem]">
          {i18n("Difference: {difference}", {
            difference: eur(Math.abs(payload[0].value - payload[1].value)),
          })}{" "}
          ({payload[0].value < payload[1].value ? i18n("Buying ahead") : i18n("Renting ahead")})
        </div>
      )}
    </div>
  );
}

type CostChartProps = {
  readonly data: readonly ChartDataPoint[];
  readonly years: number;
};

export default function CostChart({ data, years }: CostChartProps) {
  const i18n = useI18n();
  const [viewYears, setViewYears] = useState(10);

  // Calculate VIEW_OPTIONS dynamically: if years > 40, distribute evenly to years
  const VIEW_OPTIONS =
    years > 40 ? Array.from({ length: 4 }, (_, i) => Math.round(((i + 1) * years) / 4)) : DEFAULT_VIEW_OPTIONS;

  useEffect(() => {
    // Ensure we always show at least the full years range, but respect available data
    const maxAvailable = data.length;
    const targetYears = Math.min(years, maxAvailable);
    if (viewYears < targetYears) {
      setViewYears(targetYears);
    }
  }, [years, data.length]);

  const effectiveView = viewYears;
  const visibleData = data.slice(0, effectiveView);

  const crossover = visibleData.find(
    (d, i) => i > 0 && visibleData[i - 1].buying > visibleData[i - 1].renting && d.buying <= d.renting,
  );
  const crossoverYear = crossover?.year;

  const allValues = visibleData.flatMap((d) => [d.buying, d.renting]);
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues, 0);

  return (
    <div className="pointer-events-auto py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-neutral text-[0.85rem] font-bold tracking-wide uppercase">
          {i18n("Renting cost vs Buying cost over years")}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {crossoverYear && (
            <span
              className={`rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[0.75rem] font-semibold whitespace-nowrap text-amber-800`}
            >
              🏠 {i18n("Buying cheaper from year {crossoverYear}", { crossoverYear })}
            </span>
          )}

          <div className={`border-neutral-disabled flex shrink-0 overflow-hidden rounded-md border`}>
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`[&+button]:border-neutral-disabled cursor-pointer border-none px-2.5 py-1 text-[0.75rem] font-semibold transition-colors duration-150 [&+button]:border-l ${
                  effectiveView === opt
                    ? "bg-on-surface text-surface"
                    : "bg-surface text-neutral hover:bg-neutral/10 hover:text-on-surface"
                } `}
                onClick={() => setViewYears(opt)}
              >
                {opt} {i18n("yr")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={visibleData}
          margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
          style={{ cursor: "crosshair" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-disabled)" vertical={false} />

          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--color-neutral)" }}
            label={{
              value: i18n("Year"),
              position: "insideBottom",
              offset: -2,
              fontSize: 12,
              fill: "var(--color-neutral)",
            }}
            height={36}
          />
          <YAxis
            tickFormatter={(v) => (v < 0 ? `-€${Math.abs(v / 1000).toFixed(0)}k` : `€${(v / 1000).toFixed(0)}k`)}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--color-neutral)" }}
            width={40}
            domain={[minVal * 1.05, maxVal * 1.05]}
          />

          <Tooltip content={<ChartTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: 13, color: "var(--color-neutral)", fontWeight: 500 }}>{value}</span>
            )}
          />

          <ReferenceLine y={0} stroke="var(--color-neutral-disabled)" strokeWidth={1} />

          {crossoverYear && (
            <ReferenceLine
              x={crossoverYear}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: i18n("Year {crossoverYear}", { crossoverYear }),
                position: "top",
                fontSize: 11,
                fill: "#f59e0b",
              }}
            />
          )}

          <ReferenceLine
            x={years}
            stroke="var(--color-neutral)"
            strokeDasharray="3 3"
            strokeWidth={1.5}
            label={{
              value: i18n("Now (yr {years})", { years }),
              position: years > effectiveView * 0.7 ? "insideTopLeft" : "insideTopRight",
              fontSize: 10,
              fill: "var(--color-neutral)",
            }}
          />

          <Line
            type="monotone"
            dataKey="buying"
            name={i18n("Buying")}
            stroke={BUYING_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: BUYING_COLOR, strokeWidth: 2, stroke: "var(--color-surface)" }}
          />
          <Line
            type="monotone"
            dataKey="renting"
            name={i18n("Renting")}
            stroke={RENTING_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: RENTING_COLOR, strokeWidth: 2, stroke: "var(--color-surface)" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-neutral mt-1 text-center text-[0.72rem]">
        {i18n(
          "Net cumulative position - below zero means that path is in overall profit (equity / returns exceed all costs paid)",
        )}
      </p>
    </div>
  );
}
