import { beforeEach, expect, it, vi } from "vitest";

import { getVenueMessagingState } from "./messaging";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("~/lib/db/db", () => ({ default: query }));
beforeEach(() => vi.resetAllMocks());

it("does not query the database for anonymous visitors", async () => {
  expect(await getVenueMessagingState("venue")).toEqual({
    initialMessagingRole: null,
    initialTelegramLinked: null,
    initialTelegramReviewNotificationsEnabled: null,
  });
  expect(query).not.toHaveBeenCalled();
});

it("withholds private preferences from other signed-in visitors", async () => {
  query.mockResolvedValue([{ owner_id: "owner", telegram_linked: true, telegram_review_notifications_enabled: true }]);
  expect(await getVenueMessagingState("venue", "visitor")).toEqual({
    initialMessagingRole: "USER",
    initialTelegramLinked: null,
    initialTelegramReviewNotificationsEnabled: null,
  });
  expect(query).toHaveBeenCalledOnce();
});

it("returns preferences to the owner without returning their Telegram chat id", async () => {
  query.mockResolvedValue([{ owner_id: "owner", telegram_linked: true, telegram_review_notifications_enabled: false }]);
  expect(await getVenueMessagingState("venue", "owner")).toEqual({
    initialMessagingRole: "OWNER",
    initialTelegramLinked: true,
    initialTelegramReviewNotificationsEnabled: false,
  });
});

it.each([{ rows: [] }, { rows: [{ owner_id: null }] }])(
  "disables messaging for a missing or unclaimed venue",
  async ({ rows }) => {
    query.mockResolvedValue(rows);
    expect((await getVenueMessagingState("venue", "visitor")).initialMessagingRole).toBeNull();
  },
);
