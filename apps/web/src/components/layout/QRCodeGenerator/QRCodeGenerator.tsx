"use client";

import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

import { Button, Input, SectionCard } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { UrlHelper } from "~/lib/url-helper";

const dimension = 512;
const margin = dimension / 16;
const fontSize = margin;

const qrCode = new QRCodeStyling({
  cornersDotOptions: {
    type: "dot",
  },
  cornersSquareOptions: {
    color: "#273D6C",
    type: "extra-rounded",
  },
  dotsOptions: {
    color: "#12284A",
    type: "rounded",
  },
  height: dimension + margin * 6,
  image: "/static/mandrii.png",
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.5,
    margin: margin / 4,
  },
  margin,
  qrOptions: {
    errorCorrectionLevel: "M",
  },
  width: dimension,
});

const QRCodeGenerator = () => {
  const i18n = useI18n();
  const [path, setPath] = useState("");
  const [readyPath, setReadyPath] = useState<null | string>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const referenceHostname = `ref.${UrlHelper.getProductionHostname()}`;

  useEffect(() => {
    if (qrRef.current) {
      qrCode.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    const normalizedPath = path.trim().replace(/^\/+/, "");
    if (!normalizedPath) {
      return;
    }

    try {
    const url = new URL(`/${normalizedPath}`, `https://${referenceHostname}`);
    const data = url.toString();
    const topic = decodeURI(url.pathname.slice(1));

      qrCode.update({ data });
      const drawingTimeout = window.setTimeout(() => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (!canvas) return;

        const font = getComputedStyle(canvas).fontFamily;

        const ctx = canvas.getContext("2d");

        if (ctx) {
          const textX = canvas.width / 2;

          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          ctx.fillStyle = "#273D6C";
          ctx.font = `${fontSize}px ${font}`;
          ctx.fillText(`ref.${UrlHelper.getProductionHostname()}`, textX, margin * 2);

          const barWidth = canvas.width;
          const barHeight = margin * 3;

          const barX = 0;
          const barY = canvas.height - barHeight;
          const textY = barY + margin;

          ctx.fillStyle = "#273D6C";
          ctx.fillRect(barX, barY, barWidth, barHeight);

          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${fontSize}px ${font}`;
          ctx.fillText(`/${topic}`, textX, textY);

          ctx.lineWidth = 10;
          ctx.strokeStyle = "#273D6C";
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
          setReadyPath(path);
        }
      }, 2000);

      return () => window.clearTimeout(drawingTimeout);
    } catch (error) {
      console.error(error);
    }
  }, [path, referenceHostname]);

  const handleDownload = () => {
    qrCode.download({
      extension: "png",
    });
  };

  return (
    <main className="w-full max-w-4xl space-y-6">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold">{i18n("QR codes")}</h1>
        <p className="text-neutral">{i18n("Create a QR code for a short Mandrii reference link.")}</p>
        <p className="text-sm text-neutral">
          {i18n(
            "Enter the path after https://{host}/, for example your-topic. Scanning the code opens the complete link.",
            { host: referenceHostname },
          )}
        </p>
      </div>
      <SectionCard className="max-w-3xl" title={i18n("Reference link")}>
        <div className={`
          mt-4 flex flex-col gap-3
          sm:flex-row sm:items-end
        `}>
          <div className="min-w-0 flex-1">
            <Input
              aria-label={i18n("Reference path")}
              onChange={(event) => setPath(event.target.value)}
              placeholder={i18n("your-topic")}
              prefix={<span className={`
                max-w-40 truncate text-sm
                sm:max-w-64
              `}>{`https://${referenceHostname}/`}</span>}
              value={path}
            />
          </div>
          <Button disabled={!path.trim() || readyPath !== path} onClick={handleDownload}>
            {i18n("Download QR code")}
          </Button>
        </div>
      </SectionCard>

      <SectionCard className={`
        flex min-h-[24rem] items-center justify-center p-6
      `} title={i18n("Preview")}>
        <div ref={qrRef} />
      </SectionCard>
    </main>
  );
};

export default QRCodeGenerator;
