import { beforeEach, expect, it, vi } from "vitest";

const { entries, fetchMock, policies } = vi.hoisted(() => ({
  entries: new Map<string, unknown>(),
  fetchMock: vi.fn(),
  policies: [] as Array<{ revalidate: number; tags: string[] }>,
}));
vi.mock("~/lib/config/public", () => ({ publicConfig: { hasura: { endpoint: "https://hasura.test/graphql" } } }));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(() => entries.clear()),
  unstable_cache: (
    fn: (...args: string[]) => Promise<unknown>,
    keys: string[],
    options: { revalidate: number; tags: string[] },
  ) => {
    policies.push(options);
    return async (...args: string[]) => {
      const key = JSON.stringify([keys, args]);
      if (!entries.has(key)) entries.set(key, await fn(...args));
      return entries.get(key);
    };
  },
}));
import { invalidatePublicContent } from "./invalidate";
import { canonicalJson } from "./operations";
import { getCachedPublicQuery } from "./query";

beforeEach(() => {
  entries.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({ json: async () => ({ data: { venues: [{ id: "public" }] } }), ok: true });
});

it("reuses equivalent filters across requests and fetches again after invalidation", async () => {
  await getCachedPublicQuery("GetPublicVenues", {
    limit: 12,
    where: { city: { _eq: "London" }, country: { _eq: "GB" } },
  });
  await getCachedPublicQuery("GetPublicVenues", {
    limit: 12,
    where: { city: { _eq: "London" }, country: { _eq: "GB" } },
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  invalidatePublicContent();
  await getCachedPublicQuery("GetPublicVenues", {
    limit: 12,
    where: { city: { _eq: "London" }, country: { _eq: "GB" } },
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("uses only public credentials and enforces visibility outside submitted filters", async () => {
  await getCachedPublicQuery("GetPublicVenues", { token: "secret", where: { status: { _eq: "PENDING" } } });
  const [, init] = fetchMock.mock.calls[0];
  expect(init.headers).toEqual({ "Content-Type": "application/json", "x-hasura-role": "public" });
  expect(init.cache).toBe("no-store");
  const body = JSON.parse(init.body);
  expect(body.variables.where._and[0]).toEqual({ status: { _in: ["ACTIVE", "ARCHIVED"] } });
  expect(body.variables.token).toBeUndefined();
  expect(body.query).toContain("__typename");
});

it("does not cache failed or partial GraphQL reads", async () => {
  fetchMock.mockResolvedValueOnce({
    json: async () => ({ data: { venues: [] }, errors: [{ message: "failed" }] }),
    ok: true,
  });
  await expect(getCachedPublicQuery("GetPublicVenues", {})).rejects.toThrow();
  await getCachedPublicQuery("GetPublicVenues", {});
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("separates filters and uses shorter lifetimes for event schedules", async () => {
  await getCachedPublicQuery("GetPublicVenues", { limit: 12 });
  await getCachedPublicQuery("GetPublicVenues", { limit: 24 });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(policies.some((policy) => policy.revalidate === 900)).toBe(true);
  expect(policies.some((policy) => policy.revalidate === 86400)).toBe(true);
  expect(canonicalJson([{ name: "asc" }, { city: "desc" }])).not.toBe(
    canonicalJson([{ city: "desc" }, { name: "asc" }]),
  );
});

it("coalesces concurrent cold requests into one upstream read", async () => {
  let finish!: (value: unknown) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const requests = Array.from({ length: 10 }, () => getCachedPublicQuery("GetPublicVenues", { limit: 12 }));
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  finish({ json: async () => ({ data: { venues: [] } }), ok: true });
  await Promise.all(requests);
  expect(fetchMock).toHaveBeenCalledOnce();
});

it("shares keys for defaults and ignores unused total-count filters", async () => {
  await getCachedPublicQuery("GetPublicEvents", { limit: 12, where: {} });
  await getCachedPublicQuery("GetPublicEvents", {
    includeCount: false,
    includeTotal: false,
    limit: 12,
    offset: 0,
    totalWhere: { country: { _eq: "GB" } },
    where: {},
  });
  expect(fetchMock).toHaveBeenCalledOnce();
});

it("retries a read overlapping a local edit instead of caching its old result", async () => {
  let finish!: (value: unknown) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const reading = getCachedPublicQuery<{ venues: Array<{ id: string }> }>("GetPublicVenues", {});
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  invalidatePublicContent();
  finish({ json: async () => ({ data: { venues: [{ id: "old" }] } }), ok: true });
  expect((await reading).data.venues[0].id).toBe("public");
  expect((await getCachedPublicQuery<{ venues: Array<{ id: string }> }>("GetPublicVenues", {})).data.venues[0].id).toBe(
    "public",
  );
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("reuses earlier event batches when mobile discovery grows its visible list", async () => {
  fetchMock.mockImplementation(async (_url, init) => {
    const variables = JSON.parse(init.body).variables;
    const clauses = variables.where._and[1]._and;
    const ids = clauses[1].id._in;
    return { json: async () => ({ data: { events: ids.map((id: string) => ({ id })) } }), ok: true };
  });
  const ids = Array.from({ length: 24 }, (_, index) => `event-${index}`);
  const variables = (list: string[]) => ({ limit: list.length, where: { _and: [{ status: { _eq: "ACTIVE" } }, { id: { _in: list } }] } });
  await getCachedPublicQuery("GetPublicEvents", variables(ids.slice(0, 12)));
  const result = await getCachedPublicQuery<{ events: Array<{ id: string }> }>("GetPublicEvents", variables(ids));
  expect(result.data.events.map(({ id }) => id)).toEqual(ids);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).variables.limit).toBe(12);
});
