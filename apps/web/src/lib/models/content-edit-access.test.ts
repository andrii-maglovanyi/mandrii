import { beforeEach, expect, it, vi } from "vitest";

import type { AuthenticatedSession } from "~/lib/api/context";

import { getEditableContentSlug } from "./content-edit-access";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("~/lib/db/db", () => ({ default: query }));
const session = (id: string, role = "user") => ({ accessToken: "token", user: { id, role } }) as AuthenticatedSession;
beforeEach(() => vi.resetAllMocks());

it.each(["event", "venue"] as const)("rejects another user's %s before any media operation", async (type) => {
  query.mockResolvedValue([{ owner_id: null, slug: "persisted-slug", user_id: "author" }]);
  await expect(getEditableContentSlug(type, "id", session("stranger"))).rejects.toMatchObject({ statusCode: 403 });
});
it("rejects the original submitter after a venue has been claimed", async () => {
  query.mockResolvedValue([{ owner_id: "owner", slug: "persisted-slug", user_id: "author" }]);
  await expect(getEditableContentSlug("venue", "id", session("author"))).rejects.toMatchObject({ statusCode: 403 });
  await expect(getEditableContentSlug("venue", "id", session("owner"))).resolves.toBe("persisted-slug");
});
it.each(["event", "venue"] as const)("returns the stored slug for the authorized %s author", async (type) => {
  query.mockResolvedValue([{ owner_id: null, slug: "persisted-slug", user_id: "author" }]);
  await expect(getEditableContentSlug(type, "id", session("author"))).resolves.toBe("persisted-slug");
});
it("allows administrators but still rejects nonexistent content", async () => {
  query.mockResolvedValueOnce([{ owner_id: null, slug: "persisted-slug", user_id: "author" }]).mockResolvedValueOnce([]);
  await expect(getEditableContentSlug("event", "id", session("admin", "admin"))).resolves.toBe("persisted-slug");
  await expect(getEditableContentSlug("event", "missing", session("admin", "admin"))).rejects.toMatchObject({ statusCode: 404 });
});
