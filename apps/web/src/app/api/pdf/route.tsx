import { format } from "date-fns";
import puppeteer, { LaunchOptions } from "puppeteer-core";
import React from "react";
import { z } from "zod";

import { BadRequestError, getApiContext, InternalServerError, NotFoundError, withErrorHandling } from "~/lib/api";
import { isDevelopment } from "~/lib/config/env";
import { compileMDX } from "~/lib/mdx/compiler";
import { contentManager, isSafeContentSegment } from "~/lib/mdx/reader";
import { loadPdfStyles } from "~/lib/pdf/styles";
import { UrlHelper } from "~/lib/url-helper";
import { toDateLocale } from "~/lib/utils";
import { toSnakeCase } from "~/lib/utils/string";

const createFilename = (title: string): string => {
  const date = format(new Date(), "yyyy-MM-dd");
  const filename = `${toSnakeCase(title)}_${date}.pdf`;
  return `filename*=UTF-8''${encodeURIComponent(filename)}`;
};

const contentSegment = z.string().min(1).max(160).refine(isSafeContentSegment);
const exportSchema = z.object({ id: contentSegment, type: contentSegment });

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
    console.error("Failed to generate PDF", error);
    throw new InternalServerError("Unable to generate PDF. Please try again later.");
  } finally {
    if (browser) {
      await browser.close().catch((error) => console.error("Failed to close PDF browser", error));
    }
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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError("Invalid JSON body");
    }

    const parsed = exportSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestError("A valid content id and type are required");
    const { id, type } = parsed.data;

    const data = await contentManager.getContentById(type, id, locale);

    if (!data) {
      throw new NotFoundError(`Content not found: ${type}/${id}`);
    }

    if (!data.content) {
      throw new BadRequestError("Content has no MDX body");
    }

    const MDXContent = await compileMDX(data.content);
    const tailwindCss = await loadPdfStyles();

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
      ${await renderToString(() => (
        <>
          <h1>{data.meta.title}</h1>
          <MDXContent.default />
        </>
      ))}
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
