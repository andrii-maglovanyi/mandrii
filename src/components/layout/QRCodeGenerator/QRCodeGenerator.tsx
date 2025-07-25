"use client";

import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

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
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      qrCode.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    const data = text?.includes(`ref.${UrlHelper.getProductionHostname()}`)
      ? encodeURI(text)
      : "";

    if (!data) {
      setIsDisabled(true);
      return;
    }

    const url = new URL(data);
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
          ctx.fillText(
            `ref.${UrlHelper.getProductionHostname()}`,
            textX,
            margin * 2,
          );

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
  }, [text]);

  const handleDownload = () => {
    qrCode.download({
      extension: "png",
    });
  };

  return (
    <div className={`
      m-auto flex max-w-4xl flex-col p-8
      lg:p-24
    `}>
      <div className="flex">
        <input
          className="mr-4 w-full rounded-sm border border-gray-300 p-2"
          name="link"
          onChange={(e) => setText(e.target.value)}
          type="text"
        />
        <button
          className={`
            rounded-sm bg-[#273D6C] px-4 py-2 font-bold text-white
            hover:bg-[#12284A]
            disabled:cursor-not-allowed disabled:opacity-50
          `}
          disabled={isDisabled}
          onClick={handleDownload}
        >
          Download
        </button>
      </div>

      <div className="mt-8 flex justify-center" ref={qrRef} />
    </div>
  );
};

export default QRCodeGenerator;
