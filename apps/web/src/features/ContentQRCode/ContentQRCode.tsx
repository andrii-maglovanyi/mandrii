"use client";

import QRCodeStyling from "qr-code-styling";
import { Download, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, SectionCard } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { UUID } from "~/types/uuid";

const QR_EXPORT_SIZE = 1024;
const QR_LOGO_SIZE = 512;
const QR_LOGO_SCALE = 0.9;

const getRaisedQrLogo = () =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.height = QR_LOGO_SIZE;
      canvas.width = QR_LOGO_SIZE;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Unable to prepare QR logo"));

      const displayedSize = QR_LOGO_SIZE * QR_LOGO_SCALE;
      const cardInset = QR_LOGO_SIZE * 0.06;
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.roundRect(cardInset, 0, QR_LOGO_SIZE - cardInset * 2, displayedSize, QR_LOGO_SIZE * 0.1);
      context.fill();
      // Keep the artwork clear of the lower QR dots by placing it slightly
      // above centre, while retaining transparent space underneath.
      context.drawImage(image, (QR_LOGO_SIZE - displayedSize) / 2, 0, displayedSize, displayedSize);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Unable to load QR logo"));
    image.src = "/static/mandrii.png";
  });

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
    let cancelled = false;

    void getRaisedQrLogo()
      .catch(() => "/static/mandrii.png")
      .then((image) => {
        if (cancelled || !qrRef.current) return;
        const code = new QRCodeStyling({
          data: url,
          dotsOptions: { color: "#12284A", type: "rounded" },
          height: QR_EXPORT_SIZE,
          image,
          imageOptions: { hideBackgroundDots: false, imageSize: 0.32 },
          margin: QR_EXPORT_SIZE / 42,
          qrOptions: { errorCorrectionLevel: "M" },
          width: QR_EXPORT_SIZE,
        });

        qrRef.current.replaceChildren();
        code.append(qrRef.current);
        const preview = qrRef.current.firstElementChild as HTMLElement | null;
        if (preview) {
          preview.style.height = "100%";
          preview.style.width = "100%";
        }
        qrCode.current = code;
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <SectionCard title={i18n("Download QR code")}>
      <div className="flex flex-col items-center gap-3">
        <p className="text-on-surface/70 my-2 max-w-sm text-center">
          {isTracked
            ? i18n(
                "Share this code to open your public {content} page. Each scan is tracked, and you can optionally receive scan notifications in Telegram.",
                { content: targetType === "venue" ? i18n("venue") : i18n("event") },
              )
            : i18n("Share this code to open your public {content} page.", {
                content: targetType === "venue" ? i18n("venue") : i18n("event"),
              })}
        </p>
        <div className="flex size-48 shrink-0 items-center justify-center overflow-hidden" ref={qrRef}>
          {loading && <QrCode className="text-neutral animate-pulse" size={128} />}
        </div>
        {url && <p className="text-primary my-4 text-center break-all">{url.split("/").at(-1)}</p>}
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
