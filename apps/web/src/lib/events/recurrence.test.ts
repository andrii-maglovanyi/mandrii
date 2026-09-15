import { describe, expect, it } from "vitest";

import {
  doesEventOccurInRange,
  getEventCompletionTime,
  getNextOccurrenceStart,
  getRecurrenceEnd,
  isEventScheduleFinished,
  parseRecurrenceRule,
  sortEventsByNextOccurrence,
} from "./recurrence";

describe("recurrence lifecycle", () => {
  it("parses the RRULE subset created by the picker", () => {
    expect(parseRecurrenceRule("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=4")).toEqual({
      byDays: ["MO", "WE"],
      count: 4,
      frequency: "WEEKLY",
      interval: 2,
      until: undefined,
    });
    expect(parseRecurrenceRule("FREQ=HOURLY")).toBeNull();
  });

  it("uses the final counted occurrence and its duration as the completion boundary", () => {
    const completion = getEventCompletionTime({
      end_date: "2026-01-01T11:00:00.000Z",
      is_recurring: true,
      recurrence_rule: "FREQ=DAILY;COUNT=3",
      start_date: "2026-01-01T09:00:00.000Z",
    });

    expect(completion?.toISOString()).toBe("2026-01-03T11:00:00.000Z");
    expect(
      isEventScheduleFinished(
        {
          end_date: "2026-01-01T11:00:00.000Z",
          is_recurring: true,
          recurrence_rule: "FREQ=DAILY;COUNT=3",
          start_date: "2026-01-01T09:00:00.000Z",
        },
        new Date("2026-01-03T11:00:00.001Z"),
      ),
    ).toBe(true);
  });

  it("keeps an open-ended series active but finishes an UNTIL series after its final scheduled occurrence", () => {
    expect(getRecurrenceEnd("2026-01-01T09:00:00.000Z", "FREQ=WEEKLY")).toBeNull();
    expect(getRecurrenceEnd("2026-01-05T09:00:00.000Z", "FREQ=WEEKLY;BYDAY=MO;UNTIL=20260131")?.toISOString()).toBe(
      "2026-01-26T09:00:00.000Z",
    );
    expect(
      isEventScheduleFinished(
        {
          is_recurring: true,
          recurrence_rule: "FREQ=WEEKLY;BYDAY=MO;UNTIL=20260131",
          start_date: "2026-01-05T09:00:00.000Z",
        },
        new Date("2026-01-26T09:00:00.001Z"),
      ),
    ).toBe(true);
  });

  it("rejects an end date before the first possible occurrence", () => {
    expect(getRecurrenceEnd("2026-02-01T09:00:00.000Z", "FREQ=DAILY;UNTIL=20260131")).toBeUndefined();
  });

  it("shows the upcoming session instead of the original recurring DTSTART", () => {
    expect(
      getNextOccurrenceStart(
        {
          is_recurring: true,
          recurrence_rule: "FREQ=WEEKLY;BYDAY=MO,WE",
          start_date: "2026-01-01T18:00:00.000Z",
        },
        new Date("2026-01-06T12:00:00.000Z"),
      )?.toISOString(),
    ).toBe("2026-01-07T18:00:00.000Z");
  });

  it("finds recurring occurrences inside a future date window", () => {
    expect(
      doesEventOccurInRange(
        {
          is_recurring: true,
          recurrence_rule: "FREQ=WEEKLY;BYDAY=MO",
          start_date: "2026-01-05T18:00:00.000Z",
        },
        { from: "2026-03-02T00:00:00.000Z", to: "2026-03-08T23:59:59.999Z" },
      ),
    ).toBe(true);
  });

  it("does not match a finite series beyond its final occurrence", () => {
    expect(
      doesEventOccurInRange(
        {
          is_recurring: true,
          recurrence_rule: "FREQ=WEEKLY;COUNT=2",
          start_date: "2026-01-05T18:00:00.000Z",
        },
        { from: "2026-02-01T00:00:00.000Z" },
      ),
    ).toBe(false);
  });

  it("keeps a monthly series anchored to its DTSTART day", () => {
    expect(
      getNextOccurrenceStart(
        {
          is_recurring: true,
          recurrence_rule: "FREQ=MONTHLY",
          start_date: "2026-01-31T09:00:00.000Z",
        },
        new Date("2026-03-01T00:00:00.000Z"),
      )?.toISOString(),
    ).toBe("2026-03-31T09:00:00.000Z");
  });

  it("does not truncate sparse weekly series before their counted final occurrence", () => {
    expect(
      getRecurrenceEnd("2026-01-05T09:00:00.000Z", "FREQ=WEEKLY;INTERVAL=1000;BYDAY=MO;COUNT=2")?.toISOString(),
    ).toBe("2045-03-06T09:00:00.000Z");
  });

  it("orders an older recurring event by its next session, not its original DTSTART", () => {
    const events = sortEventsByNextOccurrence(
      [
        { id: "later-one-off", start_date: "2026-03-10T09:00:00.000Z" },
        {
          id: "weekly",
          is_recurring: true,
          recurrence_rule: "FREQ=WEEKLY;BYDAY=MO",
          start_date: "2025-01-06T09:00:00.000Z",
        },
      ],
      new Date("2026-03-01T00:00:00.000Z"),
    );

    expect(events.map(({ id }) => id)).toEqual(["weekly", "later-one-off"]);
  });
  it("matches an event spanning the whole requested window", () => {
    expect(
      doesEventOccurInRange(
        {
          start_date: "2026-08-01T09:00:00Z",
          end_date: "2026-09-01T18:00:00Z",
        },
        { from: "2026-08-28", to: "2026-08-30" },
      ),
    ).toBe(true);
  });

  it("does not show an expired malformed recurring event in a future window", () => {
    expect(
      doesEventOccurInRange(
        {
          start_date: "2026-08-01T09:00:00Z",
          is_recurring: true,
          recurrence_rule: "invalid",
        },
        { from: "2026-08-28", to: "2026-08-30" },
      ),
    ).toBe(false);
  });
});
