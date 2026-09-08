import { describe, expect, it, vi } from "vitest";

const { sqlMock, transactionMock } = vi.hoisted(() => {
  const transaction = vi.fn();
  const sql = Object.assign(vi.fn(), {
    begin: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
  });
  return { sqlMock: sql, transactionMock: transaction };
});

vi.mock("~/lib/db/db", () => ({ default: sqlMock }));
vi.mock("./content-subscription-alert-deliveries", () => ({
  deliverPendingContentSubscriptionAlertDeliveries: vi
    .fn()
    .mockResolvedValue({ claimed: 0, delivered: 0, enqueued: 0, failed: 0 }),
}));

import {
  deliverPendingContentSubscriptionAlerts,
  getContentSubscriptionAlertRetryOutcome,
  markContentSubscriptionAlertsRead,
} from "./content-subscription-alerts";

describe("content subscription alert delivery", () => {
  it("uses a one-minute initial retry and makes the eighth failed claim terminal", () => {
    expect(getContentSubscriptionAlertRetryOutcome(1)).toEqual({ delaySeconds: 60, status: "PENDING" });
    expect(getContentSubscriptionAlertRetryOutcome(2)).toEqual({ delaySeconds: 120, status: "PENDING" });
    expect(getContentSubscriptionAlertRetryOutcome(8)).toEqual({ delaySeconds: null, status: "FAILED" });
  });

  it("delivers an event change only to follows that existed before the change", async () => {
    transactionMock.mockResolvedValueOnce([
      {
        attempts: 1,
        content_update_id: null,
        event_id: "event-id",
        id: "job-id",
        kind: "EVENT_CHANGED",
        source_at: "2026-09-03T12:00:00.000Z",
        venue_id: null,
      },
    ]);
    sqlMock.mockResolvedValue([]);

    await expect(deliverPendingContentSubscriptionAlerts()).resolves.toEqual({ claimed: 1, delivered: 1, failed: 0 });

    const deliveryQuery =
      sqlMock.mock.calls
        .map(([strings]) => String(strings))
        .find((query) => query.includes("INSERT INTO content_subscription_alerts")) ?? "";
    expect(deliveryQuery).toContain("subscription.event_changes_enabled");
    expect(deliveryQuery).toContain("subscription.created_at <=");
    expect(deliveryQuery).toContain("ON CONFLICT (recipient_id, alert_job_id)");
  });

  it("keeps new venue and new event area alerts independent", async () => {
    sqlMock.mockClear();
    transactionMock.mockClear();
    transactionMock.mockResolvedValueOnce([
      {
        attempts: 1,
        content_update_id: null,
        event_id: "event-id",
        id: "event-job-id",
        kind: "EVENT_PUBLISHED",
        source_at: "2026-09-03T12:00:00.000Z",
        venue_id: null,
      },
      {
        attempts: 1,
        content_update_id: null,
        event_id: null,
        id: "venue-job-id",
        kind: "VENUE_PUBLISHED",
        source_at: "2026-09-03T12:00:00.000Z",
        venue_id: "venue-id",
      },
    ]);
    sqlMock.mockResolvedValue([]);

    await expect(deliverPendingContentSubscriptionAlerts()).resolves.toEqual({ claimed: 2, delivered: 2, failed: 0 });

    const deliveryQueries = sqlMock.mock.calls
      .map(([strings]) => String(strings))
      .filter((query) => query.includes("INSERT INTO content_subscription_alerts"));
    const eventAreaQuery = deliveryQueries.find((query) => query.includes("target.start_date::text")) ?? "";
    const venueAreaQuery = deliveryQueries.find((query) => query.includes("'VENUE_PUBLISHED'")) ?? "";

    expect(eventAreaQuery).toContain("subscription.new_events_enabled");
    expect(venueAreaQuery).toContain("subscription.new_venues_enabled");
  });

  it("returns the number of unread alerts it marked", async () => {
    sqlMock.mockResolvedValueOnce([{ id: "alert-one" }, { id: "alert-two" }]);

    await expect(markContentSubscriptionAlertsRead("user-id" as never)).resolves.toBe(2);

    const query = String(sqlMock.mock.calls.at(-1)?.[0]);
    expect(query).toContain("read_at IS NULL");
    expect(query).toContain("RETURNING id");
  });
});
