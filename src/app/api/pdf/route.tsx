import { format, Locale } from "date-fns";
import { enGB, uk } from "date-fns/locale";
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
import { UrlHelper } from "~/lib/url-helper";
import { toSnakeCase } from "~/lib/utils/string";

const localeMap: Record<string, Locale> = {
  en: enGB,
  uk: uk,
};

const createFilename = (title: string) => {
  const date = format(new Date(), "yyyy-MM-dd");
  const filename = `${toSnakeCase(title)}_${date}.pdf`;

  return `filename*=UTF-8''${encodeURIComponent(filename)}`;
};

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
    const { id, type } = await req.json();

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
      <h1>${data.meta.title}</h1>
      ${await renderToString(MDXContent.default)}
    </div>
    <div class="fixed bottom-0 right-0 flex items-center justify-end space-x-1 text-sm text-neutral-disabled">
    <span>${format(new Date(data.meta.date), "dd MMMM yyyy", { locale: (locale && localeMap[locale]) ?? enGB })}</span>
    <span>&bull;</span>
    <a href="${UrlHelper.getBaseUrl()}">mandrii.com</></div>
  </body>
</html>
`;

    const buffer = await generatePdfFromHtml(fullHtml);

    return new NextResponse(buffer, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Disposition": `attachment; filename="${createFilename(data.meta.title)}.pdf"`,
        "Content-Type": "application/pdf",
      },
      status: 200,
    });
  });
