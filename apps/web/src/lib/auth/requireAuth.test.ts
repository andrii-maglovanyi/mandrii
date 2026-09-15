import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { requireAuth } from "./requireAuth";

const { auth, findById, redirect } = vi.hoisted(() => ({ auth: vi.fn(), findById: vi.fn(), redirect: vi.fn() }));
vi.mock("~/lib/auth", () => ({ auth }));
vi.mock("~/lib/models/user", () => ({
  UserModel: class {
    findById = findById;
  },
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("~/lib/url-helper", () => ({ UrlHelper: { getBaseUrl: () => "https://mandrii.com" } }));
beforeEach(() => {
  vi.resetAllMocks();
  redirect.mockImplementation((url) => {
    throw new Error(`Redirect: ${url}`);
  });
});
afterEach(() => vi.restoreAllMocks());
it("redirects anonymous users before querying the account database", async () => {
  auth.mockResolvedValue(null);
  await expect(requireAuth("/admin")).rejects.toThrow("/api/auth/signin?callbackUrl=%2Fadmin");
  expect(findById).not.toHaveBeenCalled();
});
it.each([null, { id: "user", role: "admin", status: "inactive" }])(
  "rejects missing and inactive accounts",
  async (user) => {
    auth.mockResolvedValue({ user: { id: "user", role: "admin" } });
    findById.mockResolvedValue(user);
    await expect(requireAuth()).rejects.toThrow("/en/account-inactive");
  },
);
it("returns the current database role after an administrator is demoted", async () => {
  auth.mockResolvedValue({ user: { id: "user", role: "admin" } });
  findById.mockResolvedValue({ id: "user", role: "user", status: "active" });
  expect((await requireAuth()).user.role).toBe("user");
  expect(findById).toHaveBeenCalledOnce();
});
