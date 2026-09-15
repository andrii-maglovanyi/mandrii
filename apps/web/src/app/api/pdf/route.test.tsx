import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { POST } from "./route";

const { close, content, launch, pdf, setContent } = vi.hoisted(() => ({
  close: vi.fn(),
  content: vi.fn(),
  launch: vi.fn(),
  pdf: vi.fn(),
  setContent: vi.fn(),
}));
vi.mock("~/lib/api", async () => ({
  ...(await import("~/lib/api/errors")),
  ...(await import("~/lib/api/withErrorHandling")),
  getApiContext: async () => ({ locale: "en" }),
}));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("~/lib/config/env", () => ({ envName: "test", isDevelopment: true }));
vi.mock("~/lib/mdx/reader", async (original) => ({
  ...(await original<object>()),
  contentManager: { getContentById: content },
}));
vi.mock("~/lib/mdx/compiler", () => ({ compileMDX: async () => ({ default: () => <p>Article body</p> }) }));
vi.mock("~/lib/pdf/styles", () => ({ loadPdfStyles: async () => "body { color: black; }" }));
vi.mock("~/lib/url-helper", () => ({ UrlHelper: { getBaseUrl: () => "https://mandrii.com" } }));
vi.mock("~/lib/utils", () => ({ toDateLocale: () => undefined }));
vi.mock("puppeteer-core", () => ({ default: { launch } }));

const request = (body: unknown) =>
  new Request("https://mandrii.com/api/pdf", { body: JSON.stringify(body), method: "POST" });
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  content.mockResolvedValue({ content: "Article", meta: { date: "2026-09-14", title: "<script>alert(1)</script>" } });
  launch.mockResolvedValue({ close, newPage: async () => ({ pdf, setContent }) });
  pdf.mockResolvedValue(new Uint8Array([37, 80, 68, 70]));
  close.mockResolvedValue(undefined);
});
afterEach(() => vi.restoreAllMocks());

it.each([null, [], { id: 1, type: "posts" }, { id: "../../../README", type: "posts" }, { id: "guide", type: ".." }])(
  "rejects invalid payloads before accessing content or launching Chromium",
  async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(content).not.toHaveBeenCalled();
    expect(launch).not.toHaveBeenCalled();
  },
);
it("renders escaped titles, serves a PDF attachment, and closes Chromium", async () => {
  const response = await POST(request({ id: "guide", type: "posts" }));
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("application/pdf");
  expect(response.headers.get("Content-Disposition")).toContain("attachment;");
  expect(setContent.mock.calls[0][0]).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(close).toHaveBeenCalledOnce();
});
it("closes Chromium after failure and hides internal error details", async () => {
  pdf.mockRejectedValue(new Error("private filesystem path"));
  const response = await POST(request({ id: "guide", type: "posts" }));
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain("private filesystem path");
  expect(close).toHaveBeenCalledOnce();
});
