"use client";

import { BarChart3, QrCode } from "lucide-react";
import { useEffect, useState } from "react";

import { SectionCard } from "~/components/ui";
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
  const [isTracked, setIsTracked] = useState(false);

  useEffect(() => {
    const queryKey = targetType === "venue" ? "venueId" : "eventId";
    const load = async () => {
      const response = await fetch(`/api/content-qr?${queryKey}=${encodeURIComponent(targetId)}`);
      if (!response.ok) return;
      const result = (await response.json()) as { scans: number; tracked: boolean };
      setScans(result.scans);
      setIsTracked(result.tracked);
    };
    void load();
  }, [targetId, targetType]);

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
    </SectionCard>
  );
};
