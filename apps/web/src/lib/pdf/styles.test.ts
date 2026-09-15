import { beforeEach, expect, it, vi } from "vitest";

const { readdir, readFile } = vi.hoisted(() => ({ readdir: vi.fn(), readFile: vi.fn() }));
vi.mock("node:fs/promises", () => ({ default: { readdir, readFile } }));
vi.mock("~/lib/config/env", () => ({ isDevelopment: false }));
beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

it("loads Turbopack CSS when the webpack directory is absent and shares concurrent reads", async () => {
  readdir.mockImplementation(async (directory: string) => {
    if (directory.endsWith("/css")) throw Object.assign(new Error("missing"), { code: "ENOENT" });
    return ["b.css", "a.css", "bundle.js"];
  });
  readFile.mockImplementation(async (filename: string) => (filename.endsWith("a.css") ? "a{}" : "b{}"));
  const { loadPdfStyles } = await import("./styles");
  expect(await Promise.all([loadPdfStyles(), loadPdfStyles()])).toEqual(["a{}\nb{}", "a{}\nb{}"]);
  expect(await loadPdfStyles()).toBe("a{}\nb{}");
  expect(readdir).toHaveBeenCalledTimes(2);
  expect(readFile).toHaveBeenCalledTimes(2);
});

it("retries a failed read rather than caching the rejection", async () => {
  readdir.mockRejectedValueOnce(Object.assign(new Error("denied"), { code: "EACCES" })).mockResolvedValue([]);
  const { loadPdfStyles } = await import("./styles");
  await expect(loadPdfStyles()).rejects.toThrow("denied");
  readdir.mockResolvedValue(["main.css"]);
  readFile.mockResolvedValue("body{}");
  await expect(loadPdfStyles()).resolves.toContain("body{}");
});

it("fails explicitly when no compiled styles exist", async () => {
  readdir.mockResolvedValue(["main.js"]);
  const { loadPdfStyles } = await import("./styles");
  await expect(loadPdfStyles()).rejects.toThrow("No compiled PDF styles");
  expect(readFile).not.toHaveBeenCalled();
});
