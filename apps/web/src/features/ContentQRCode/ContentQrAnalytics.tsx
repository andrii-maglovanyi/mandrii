"use client";

import { BarChart3, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import { Button, SectionCard } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { UUID } from "~/types/uuid";

export const ContentQrAnalytics = ({
  targetId,
  targetType = "venue",
}: {
  targetId: UUID;
  targetType?: "event" | "venue";
}) => {
  const i18n = useI18n();
  const [scans, setScans] = useState<number | null>(null);
  const [period, setPeriod] = useState<"month" | "week" | "year">("week");
  const [scanSeries, setScanSeries] = useState<Array<{ count: number; date: string }>>([]);
  const [isTracked, setIsTracked] = useState(false);

  useEffect(() => {
    const queryKey = targetType === "venue" ? "venueId" : "eventId";
    const load = async () => {
      const response = await fetch(`/api/content-qr?${queryKey}=${encodeURIComponent(targetId)}&period=${period}`);
      if (!response.ok) return;
      const result = (await response.json()) as {
        scanSeries: Array<{ count: number; date: string }>;
        scans: number;
        tracked: boolean;
      };
      setScanSeries(result.scanSeries);
      setScans(result.scans);
      setIsTracked(result.tracked);
    };
    void load();
  }, [period, targetId, targetType]);

  const formatLabel = (date: string) => {
    const isMonth = /^\d{4}-\d{2}$/.test(date);
    const parsedDate = new Date(`${isMonth ? `${date}-01` : date}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return new Intl.DateTimeFormat(undefined, isMonth ? { month: "short" } : { day: "numeric", month: "short" }).format(
      parsedDate,
    );
  };

  const renderTooltip = ({ active, label, payload }: TooltipContentProps) => {
    const value = payload?.[0]?.value;
    if (!active || value === undefined || value === null) return null;

    return (
      <div className="border-primary/25 bg-surface text-on-surface rounded-lg border px-3 py-2 shadow-lg">
        <p className="text-neutral text-xs">{formatLabel(String(label))}</p>
        <p className="text-primary mt-1 font-semibold">
          {i18n("Scans")}: {value}
        </p>
      </div>
    );
  };

  return (
    <SectionCard title={i18n("QR analytics")}>
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
          <BarChart3 size={22} />
        </div>
        <div>
          <p className="text-2xl font-semibold">{scans ?? "—"}</p>
          <p className="text-on-surface/70 text-sm">{i18n("Total QR code scans")}</p>
        </div>
      </div>
      {!isTracked && scans !== null && (
        <p className="text-neutral mt-3 flex items-center gap-2 text-sm">
          <QrCode size={16} />
          {i18n("Scan tracking becomes available when reference-link tracking is configured.")}
        </p>
      )}
      {scans !== null && (
        <div className="mt-6 border-t border-current/10 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">{i18n("QR code scans")}</h3>
            <div className="flex gap-1" role="group" aria-label={i18n("Analytics period")}>
              {(["week", "month", "year"] as const).map((option) => (
                <Button
                  key={option}
                  onClick={() => setPeriod(option)}
                  size="sm"
                  variant={period === option ? "filled" : "ghost"}
                >
                  {i18n(option === "week" ? "Week" : option === "month" ? "Month" : "Year")}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-64 min-w-0" role="img" aria-label={i18n("QR code scan chart")}>
            <ResponsiveContainer height="100%" minHeight={256} minWidth={0} width="100%">
              <AreaChart data={scanSeries} margin={{ bottom: 0, left: -20, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="qr-scan-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#F6D34B" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#F6D34B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" strokeDasharray="3 3" strokeOpacity={0.12} vertical={false} />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  stroke="currentColor"
                  strokeOpacity={0.65}
                  tickFormatter={formatLabel}
                />
                <YAxis allowDecimals={false} fontSize={12} stroke="currentColor" strokeOpacity={0.65} />
                <Tooltip content={renderTooltip} cursor={{ stroke: "currentColor", strokeOpacity: 0.25 }} />
                <Area
                  dataKey="count"
                  fill="url(#qr-scan-fill)"
                  name={i18n("Scans")}
                  stroke="#F6D34B"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
