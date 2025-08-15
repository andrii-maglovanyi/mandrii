"use client";

import dynamic from "next/dynamic";

const QRCodeGenerator = dynamic(() => import("~/components/layout/QRCodeGenerator/QRCodeGenerator"), {
  ssr: false,
});

export default function QRPage() {
  return <QRCodeGenerator />;
}
