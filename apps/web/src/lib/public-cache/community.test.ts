import { beforeEach, expect, it, vi } from "vitest";

const { entries, sql } = vi.hoisted(() => ({ entries: new Map<string, unknown>(), sql: vi.fn() }));
vi.mock("~/lib/api", async () => import("~/lib/api/errors"));
vi.mock("~/lib/db/db", () => ({ default: sql }));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(() => entries.clear()),
  unstable_cache: (fn: (key: string) => Promise<unknown>) => async (key: string) => {
    if (!entries.has(key)) entries.set(key, await fn(key));
    return entries.get(key);
  },
}));
import { closeCommunityRequest, getCommunityRequestPage } from "~/lib/models/community-requests";

const post = {
  author_id: "author",
  author_image: null,
  author_name: "Author",
  body: "Hello",
  category: "PRACTICAL_SUPPORT",
  country: "GB",
  created_at: "2026-01-01T00:00:00Z",
  expires_at: "2099-01-01T00:00:00Z",
  id: "post",
  kind: "REQUEST",
  location: null,
  location_rank: 0,
  related_event_id: null,
  related_venue_id: null,
  response_count: 1,
  status: "OPEN",
  title: "Help",
  viewer_response_id: null,
};
beforeEach(() => {
  entries.clear();
  sql.mockReset();
  sql.mockImplementation(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join("");
    if (query.includes("COUNT(*)::int AS total")) return [{ total: 1 }];
    if (query.includes("SELECT id, request_id"))
      return values[0] === "alice" ? [{ id: "alice-response", request_id: "post" }] : [];
    if (query.includes("SELECT user_id FROM community_requests")) return [{ user_id: "author" }];
    if (query.includes("FROM community_requests request")) return [post];
    return [];
  });
});

it("shares public SQL results without sharing a viewer's response ID", async () => {
  const alice = await getCommunityRequestPage({ viewerUserId: "alice" }, null);
  const bob = await getCommunityRequestPage({ viewerUserId: "bob" }, null);
  const guest = await getCommunityRequestPage({}, null);
  expect(alice.requests[0].viewerResponseId).toBe("alice-response");
  expect(bob.requests[0].viewerResponseId).toBeNull();
  expect(guest.requests[0].viewerResponseId).toBeNull();
  expect(
    sql.mock.calls.filter(([strings]) => strings.join("").includes("FROM community_requests request")),
  ).toHaveLength(2);
  expect([...entries.keys()][0]).not.toContain("alice");
  expect([...entries.keys()][0]).not.toContain("bob");
});

it("removes expired posts on cache hits and keeps the pagination cursor", async () => {
  await getCommunityRequestPage({}, null);
  const cached = [...entries.values()][0] as { nextCursor: null | string; requests: Array<{ expiresAt: string }> };
  cached.requests[0].expiresAt = "2000-01-01T00:00:00Z";
  cached.nextCursor = "next-page";
  const page = await getCommunityRequestPage({}, null);
  expect(page.requests).toEqual([]);
  expect(page.nextCursor).toBe("next-page");
});

it("expires the shared feed after an author closes a post", async () => {
  await getCommunityRequestPage({}, null);
  expect(entries.size).toBe(1);
  await closeCommunityRequest("post", "author");
  expect(entries.size).toBe(0);
});
