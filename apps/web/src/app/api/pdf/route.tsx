import { format } from "date-fns";
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer, { LaunchOptions } from "puppeteer-core";
import React from "react";

import { BadRequestError, getApiContext, InternalServerError, NotFoundError, withErrorHandling } from "~/lib/api";
import { isDevelopment } from "~/lib/config/env";
import { compileMDX } from "~/lib/mdx/compiler";
import { contentManager } from "~/lib/mdx/reader";
import { UrlHelper } from "~/lib/url-helper";
import { toDateLocale } from "~/lib/utils";
import { toSnakeCase } from "~/lib/utils/string";

const createFilename = (title: string): string => {
  const date = format(new Date(), "yyyy-MM-dd");
  const filename = `${toSnakeCase(title)}_${date}.pdf`;
  return `filename*=UTF-8''${encodeURIComponent(filename)}`;
};

interface ExportRequest {
  id: string;
  type: string;
}

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

  let browser;
  try {
    browser = await puppeteer.launch(launchOptions);
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

    return buffer;
  } catch (error) {
    throw new InternalServerError(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function loadTailwindCss(): Promise<string> {
  try {
    const cssDir = path.join(process.cwd(), ".next/static/css");
    const files = await fs.readdir(cssDir);
    const cssChunks = await Promise.all(
      files.filter((f) => f.endsWith(".css")).map((f) => fs.readFile(path.join(cssDir, f), "utf8")),
    );
    return cssChunks.join("\n");
  } catch (error) {
    throw new InternalServerError(
      `Failed to load CSS files: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function renderToString(Component: React.ComponentType): Promise<string> {
  const { renderToString } = await import("react-dom/server");
  const React = await import("react");
  return renderToString(React.createElement(Component));
}

export const POST = (req: Request): Promise<Response> =>
  withErrorHandling(async () => {
    const { locale } = await getApiContext(req);

    let body: ExportRequest;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError("Invalid JSON body");
    }

    const { id, type } = body;

    if (!id || !type) {
      throw new BadRequestError("Missing required fields: id and type");
    }

    const data = await contentManager.getContentById(type, id, locale);

    if (!data) {
      throw new NotFoundError(`Content not found: ${type}/${id}`);
    }

    if (!data.content) {
      throw new BadRequestError("Content has no MDX body");
    }

    const MDXContent = await compileMDX(data.content);
    const tailwindCss = await loadTailwindCss();

    const fullHtml = `
<!DOCTYPE html>
<html lang="${locale}">
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
      <span>${format(new Date(data.meta.date), "dd MMMM yyyy", { locale: toDateLocale(locale) })}</span>
      <span>&bull;</span>
      <a href="${UrlHelper.getBaseUrl()}">mandrii.com</a>
    </div>
  </body>
</html>
`;

    const buffer = await generatePdfFromHtml(fullHtml);

    return new Response(Buffer.from(buffer), {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Disposition": `attachment; ${createFilename(data.meta.title)}`,
        "Content-Type": "application/pdf",
      },
      status: 200,
    });
  });
