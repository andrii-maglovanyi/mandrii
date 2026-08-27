"use client";

import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

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
  const [isDisabled, setIsDisabled] = useState(true);
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
      setIsDisabled(true);
      return;
    }

    const url = new URL(`/${normalizedPath}`, `https://${referenceHostname}`);
    const data = url.toString();
    const topic = decodeURI(url.pathname.slice(1));

    try {
      qrCode.update({ data });
      setTimeout(() => {
        const canvases = document.getElementsByTagName("canvas");
        if (!canvases.length) return;

        const canvas = canvases[0];

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
        }
      }, 2000);
      setIsDisabled(false);
    } catch (error) {
      console.error(error);
      setIsDisabled(true);
    }
  }, [path, referenceHostname]);

  const handleDownload = () => {
    qrCode.download({
      extension: "png",
    });
  };

  return (
    <div className={`m-auto flex max-w-4xl flex-col p-2 lg:p-4`}>
      <div className="mb-6 max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold">{i18n("QR codes")}</h1>
        <p className="text-neutral">{i18n("Create a QR code for a short Mandrii reference link.")}</p>
        <p className="text-neutral text-sm">
          {i18n(
            "Enter the path after https://{host}/, for example your-topic. Scanning the code opens the complete link.",
            { host: referenceHostname },
          )}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 overflow-hidden rounded-sm border border-gray-300">
          <span className="bg-surface-tint text-neutral flex shrink-0 items-center border-r border-gray-300 px-3 text-sm">
            {`https://${referenceHostname}/`}
          </span>
          <input
            aria-label={i18n("Reference path")}
            className="min-w-0 flex-1 bg-transparent p-2 outline-none"
            name="path"
            onChange={(event) => setPath(event.target.value)}
            placeholder={i18n("your-topic")}
            type="text"
          />
        </div>
        <button
          className={`shrink-0 rounded-sm bg-[#273D6C] px-4 py-2 font-bold text-white hover:bg-[#12284A] disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={isDisabled}
          onClick={handleDownload}
        >
          {i18n("Download")}
        </button>
      </div>

      <div className="mt-8 flex justify-center" ref={qrRef} />
    </div>
  );
};

export default QRCodeGenerator;
