"use client";

import QRCodeStyling from "qr-code-styling";
import { Download, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, SectionCard } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { UUID } from "~/types/uuid";

export const ContentQRCode = ({
  targetId,
  targetType = "venue",
}: {
  targetId: UUID;
  targetType?: "event" | "venue";
}) => {
  const i18n = useI18n();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const [url, setUrl] = useState("");
  const [isTracked, setIsTracked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/content-qr", {
          body: JSON.stringify(targetType === "venue" ? { venueId: targetId } : { eventId: targetId }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const result = (await response.json()) as { error?: string; tracked?: boolean; url?: string };
        if (!response.ok || !result.url) throw new Error(result.error || i18n("Unable to create QR code"));
        setUrl(result.url);
        setIsTracked(Boolean(result.tracked));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : i18n("Unable to create QR code"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [i18n, targetId, targetType]);

  useEffect(() => {
    if (!url || !qrRef.current) return;
    const code = new QRCodeStyling({
      data: url,
      dotsOptions: { color: "#12284A", type: "rounded" },
      height: 192,
      image: "/static/mandrii.png",
      imageOptions: { hideBackgroundDots: true, imageSize: 0.32 },
      margin: 12,
      qrOptions: { errorCorrectionLevel: "M" },
      width: 192,
    });
    qrRef.current.replaceChildren();
    code.append(qrRef.current);
    qrCode.current = code;
  }, [url]);

  return (
    <SectionCard title={i18n("Download QR code")}>
      <div className="flex flex-col items-center gap-3">
        <p className="text-on-surface/70 max-w-sm text-center text-sm">
          {isTracked
            ? i18n(
                "Share this code to open your public {content} page. Each scan is tracked, and you can optionally receive scan notifications in Telegram.",
                { content: targetType === "venue" ? i18n("venue") : i18n("event") },
              )
            : i18n("Share this code to open your public {content} page.", {
                content: targetType === "venue" ? i18n("venue") : i18n("event"),
              })}
        </p>
        <div className="flex min-h-48 items-center justify-center" ref={qrRef}>
          {loading && <QrCode className="text-neutral animate-pulse" size={48} />}
        </div>
        {url && <p className="text-neutral text-center text-xs break-all">{url}</p>}
        <Button
          disabled={!url}
          onClick={() => qrCode.current?.download({ extension: "png", name: `${targetType}-qr-code` })}
        >
          <span className="flex items-center gap-2">
            <Download size={16} />
            {i18n("Download")}
          </span>
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </SectionCard>
  );
};
