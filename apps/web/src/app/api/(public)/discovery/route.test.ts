import { beforeEach, expect, it, vi } from "vitest";
const { rateLimit, read } = vi.hoisted(() => ({ rateLimit: vi.fn(), read: vi.fn() }));
vi.mock("~/lib/public-cache/query", () => ({ getCachedPublicQuery: read }));
vi.mock("~/lib/api", async () => ({
  ...(await import("~/lib/api/errors")),
  rateLimiters: { discovery: { check: rateLimit } },
  withErrorHandling: async (fn: () => Promise<Response>) => {
    try {
      return await fn();
    } catch {
      return new Response("Invalid query", { status: 400 });
    }
  },
}));
import { POST } from "./route";
beforeEach(() => {
  vi.clearAllMocks();
  read.mockResolvedValue({ data: { venues: [] } });
});
const request = (body: unknown) =>
  new Request("https://mandrii.test/api/discovery", { body: JSON.stringify(body), method: "POST" });
it("ignores supplied documents and credentials and dispatches only a fixed public read", async () => {
  const response = await POST(
    request({
      operationName: "GetPublicVenues",
      query: "mutation { delete_users { affected_rows } }",
      variables: { limit: 12, token: "private" },
    }),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(read).toHaveBeenCalledWith("GetPublicVenues", { limit: 12 });
  expect(rateLimit).toHaveBeenCalledOnce();
});
it("rejects private operations and invalid pagination before reading the cache", async () => {
  expect((await POST(request({ operationName: "GetUserVenues", variables: {} }))).status).toBe(400);
  expect((await POST(request({ operationName: "GetPublicVenues", variables: { limit: -1 } }))).status).toBe(400);
  expect(read).not.toHaveBeenCalled();
});

it("rejects malformed JSON, oversized bodies and unsupported filter operators before querying", async () => {
  const malformed = new Request("https://mandrii.test/api/discovery", { body: "{", method: "POST" });
  expect((await POST(malformed)).status).toBe(400);
  expect(
    (await POST(request({ operationName: "GetPublicVenues", variables: { where: { name: { _regex: "expensive" } } } })))
      .status,
  ).toBe(400);
  expect((await POST(request({ operationName: "GetPublicVenues", query: "a".repeat(1_000_001) }))).status).toBe(400);
  let where: unknown = {};
  for (let i = 0; i < 20; i++) where = { _not: where };
  expect((await POST(request({ operationName: "GetPublicVenues", variables: { where } }))).status).toBe(400);
  expect(read).not.toHaveBeenCalled();
});

it("preserves large accumulated mobile pages and valid geographic filters", async () => {
  const response = await POST(
    request({
      operationName: "GetPublicEvents",
      variables: {
        limit: 1008,
        offset: 0,
        where: {
          _and: [{ geo: { _st_d_within: { distance: "10000", from: { coordinates: [-0.1, 51.5], type: "Point" } } } }],
        },
      },
    }),
  );
  expect(response.status).toBe(200);
  expect(read.mock.calls[0][1].limit).toBe(1008);
});
