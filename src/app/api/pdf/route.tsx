import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import puppeteer, { LaunchOptions } from "puppeteer-core";
import React from "react";

import { getLocaleContext } from "~/lib/api/helpers";
import { withErrorHandling } from "~/lib/api/withErrorHandling";
import { isDevelopment } from "~/lib/config/env";
import { compileMDX } from "~/lib/mdx/compiler";
import { contentManager } from "~/lib/mdx/reader";

async function generatePdfFromHtml(htmlContent: string) {
  const launchOptions: LaunchOptions = {
    headless: true,
  };

  if (isDevelopment) {
    launchOptions.executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else {
    const chromium = (await import("@sparticuz/chromium")).default;
    launchOptions.executablePath = await chromium.executablePath();
    launchOptions.args = chromium.args;
  }

  console.log("Launching Puppeteer with options:", launchOptions);

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const buffer = await page.pdf({
    format: "A4",
    margin: {
      bottom: "0.75in",
      left: "0.75in",
      right: "0.75in",
      top: "0.75in",
    },
    printBackground: true,
    scale: 0.8,
  });

  await browser.close();

  return buffer;
}

async function renderToString(Component: React.ComponentType) {
  const { renderToString } = await import("react-dom/server");
  const React = await import("react");
  return renderToString(React.createElement(Component));
}

export const POST = (req: NextRequest) =>
  withErrorHandling(async () => {
    const { locale } = await getLocaleContext(req);

    const { filename, id, type } = await req.json();

    const data = await contentManager.getContentById(type, id, locale);

    if (!data?.content) {
      return NextResponse.json({ error: "MDX content is required" }, { status: 400 });
    }

    const MDXContent = await compileMDX(data.content);

    const cssDir = path.join(process.cwd(), ".next/static/css");
    const files = await fs.readdir(cssDir);
    const cssChunks = await Promise.all(
      files.filter((f) => f.endsWith(".css")).map((f) => fs.readFile(path.join(cssDir, f), "utf8")),
    );
    const tailwindCss = cssChunks.join("\n");

    console.log("Available CSS classes:", tailwindCss.includes("prose-sm") ? "prose-sm found" : "prose-sm NOT found");
    console.log("CSS length:", tailwindCss.length);

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <style>
      ${tailwindCss}

      @page { size: A4; margin: 0.5in; }

      html, body { margin: 0; padding: 0; }
      body {
        background: #fff;
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
        color-scheme: light;
      }

      /* Keep elements from splitting awkwardly */
      h1, h2, h3, h4, h5, h6 { break-after: avoid-page; }
      p, blockquote, pre, code, ul, ol, li { break-inside: avoid; }
      img, svg, figure, table { break-inside: avoid; page-break-inside: avoid; }
      img { max-width: 100%; height: auto; }

      table { width: 100%; border-collapse: collapse; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
    </style>
  </head>
  <body>
    <div class="prose prose-sm max-w-none">
      ${await renderToString(MDXContent.default)}
    </div>
  </body>
</html>
`;

    const buffer = await generatePdfFromHtml(fullHtml);

    return new NextResponse(buffer, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
      },
      status: 200,
    });
  });
