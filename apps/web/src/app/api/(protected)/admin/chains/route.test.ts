import { beforeEach, expect, it, vi } from "vitest";

import { ForbiddenError, UnauthorizedError } from "~/lib/api/errors";
import { GET, POST } from "./route";

const { context, list, save } = vi.hoisted(() => ({ context: vi.fn(), list: vi.fn(), save: vi.fn() }));
vi.mock("~/lib/api", async () => ({
  ...(await import("~/lib/api/errors")),
  ...(await import("~/lib/api/validate")),
  ...(await import("~/lib/api/withErrorHandling")),
  getApiContext: context,
}));
vi.mock("~/lib/models/chain", () => ({ listChains: list, saveChain: save }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
const userId = "550e8400-e29b-41d4-a716-446655440000";
const request = (data: unknown) => new Request("https://mandrii.com/api/admin/chains", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data) });
beforeEach(() => {
  vi.clearAllMocks();
  context.mockResolvedValue({session: { user: { id: userId, role: "admin" } }});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
it.each(["user", "moderator"])("does not read or write chain data for the %s role", async (role) => {
  context.mockResolvedValue({session: {user: { id: userId, role }}});
  expect((await GET(new Request("https://mandrii.com/api/admin/chains"))).status).toBe(403);
  expect((await POST(request({name: "Example", venueIds: []}))).status).toBe(403);
  expect(list).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});
it.each([new UnauthorizedError(), new ForbiddenError("Inactive account")])("does not bypass missing or inactive authentication", async (error) => {
  context.mockRejectedValue(error);
  expect((await POST(request({ name: "Example", venueIds: [] }))).status).toBe(error.statusCode);
  expect(save).not.toHaveBeenCalled();
});
it("validates the full payload before saving and supports creating without an ID", async () => {
  expect((await POST(request({name: "Example", venueIds: ["not-a-uuid"]}))).status).toBe(422);
  expect(save).not.toHaveBeenCalled();
  save.mockResolvedValue({ id: userId });
  const response = await POST(request({name: " Example ", venueIds: []}));
  expect(response.status).toBe(200);
  expect(save).toHaveBeenCalledWith({ name: "Example", venueIds: [] }, userId);
});
