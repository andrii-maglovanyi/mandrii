import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Locale } from "~/types";

import { contentManager } from "./reader";

const { existsSync, readFileSync } = vi.hoisted(() => ({ existsSync: vi.fn(), readFileSync: vi.fn() }));
vi.mock("node:fs", () => ({ default: { existsSync, readFileSync } }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

it.each([
  { id: "../../../README", type: "posts" },
  { id: "README", type: "../../.." },
  { id: "README", type: "/tmp" },
  { id: "..\\secret", type: "posts" },
  { id: "..", type: "posts" },
  { id: "bad\0name", type: "posts" },
])("rejects unsafe content lookups before accessing the filesystem: $type/$id", async ({ id, type }) => {
  expect(await contentManager.getContentById(type, id)).toBeNull();
  expect(contentManager.contentExists(type, id)).toBe(false);
  expect(existsSync).not.toHaveBeenCalled();
  expect(readFileSync).not.toHaveBeenCalled();
});

it("still falls back to English content within the fixed content directory", async () => {
  const expectedPath = path.join(process.cwd(), "content", "posts", "en", "guide.md");
  existsSync.mockImplementation((filename) => filename === expectedPath);
  readFileSync.mockReturnValue("---\ntitle: Guide\ndate: 2026-09-14\n---\nWelcome");
  const result = await contentManager.getContentById("posts", "guide", Locale.UK);
  expect(result).toMatchObject({ id: "guide", meta: { title: "Guide" } });
  expect(readFileSync).toHaveBeenCalledExactlyOnceWith(expectedPath, "utf8");
});
