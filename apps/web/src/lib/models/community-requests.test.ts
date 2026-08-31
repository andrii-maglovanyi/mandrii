import { describe, expect, it, vi } from "vitest";

const { sqlMock, transactionMock } = vi.hoisted(() => {
  const transaction = vi.fn();
  const sql = Object.assign(vi.fn(), {
    begin: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
  });
  return { sqlMock: sql, transactionMock: transaction };
});

vi.mock("~/lib/db/db", () => ({ default: sqlMock }));
vi.mock("~/lib/api", async () => import("~/lib/api/errors"));

import { ConflictError, ForbiddenError } from "~/lib/api/errors";
import { createCommunityRequest, createCommunityRequestResponse, getCommunityRequestPage } from "./community-requests";

const responseResult = {
  author_id: "responder-id",
  author_image: null,
  author_name: "Responder",
  body: null,
  created_at: null,
  id: null,
  message_count: 0,
  request_author_id: "author-id",
  request_exists: true,
  request_id: null,
  request_is_open: true,
};

describe("community request concurrency safeguards", () => {
  it("uses the unique response constraint as the final duplicate-response guard", async () => {
    sqlMock.mockResolvedValueOnce([responseResult]);

    await expect(
      createCommunityRequestResponse({ body: "I can help with this", requestId: "request-id", userId: "responder-id" }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(String(sqlMock.mock.calls[0]?.[0])).toContain("ON CONFLICT (request_id, user_id) DO NOTHING");
    expect(String(sqlMock.mock.calls[0]?.[0])).toContain("FOR SHARE");
  });

  it("still rejects a post author before a response is inserted", async () => {
    sqlMock.mockResolvedValueOnce([{ ...responseResult, request_author_id: "author-id" }]);

    await expect(
      createCommunityRequestResponse({ body: "I can help with this", requestId: "request-id", userId: "author-id" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("serialises active-post checks per author", async () => {
    transactionMock.mockResolvedValueOnce([]).mockResolvedValueOnce([{ active_count: 10 }]);

    await expect(
      createCommunityRequest({
        body: "A few useful details for the community.",
        category: "PRACTICAL_SUPPORT",
        country: "United Kingdom",
        expiresAt: new Date("2026-09-01T00:00:00.000Z"),
        kind: "REQUEST",
        location: "London",
        relatedEventId: null,
        relatedVenueId: null,
        title: "Need a little help",
        userId: "author-id",
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(String(transactionMock.mock.calls[0]?.[0])).toContain("FOR UPDATE");
    expect(transactionMock).toHaveBeenCalledTimes(2);
  });

  it("orders the no-location feed by the selected rank alias, not a PostgreSQL ordinal", async () => {
    sqlMock.mockReset();
    sqlMock.mockImplementation((strings: TemplateStringsArray) =>
      strings.join("").includes("COUNT(*)::int AS total") ? Promise.resolve([{ total: 0 }]) : Promise.resolve([]),
    );

    await getCommunityRequestPage({}, null);

    const query = String(sqlMock.mock.calls.find(([strings]) => String(strings).includes("FROM community_requests request"))?.[0]);
    expect(query).toContain("ORDER BY\n      location_rank,");
    expect(query).not.toContain("ORDER BY\n      0,");
  });
});
