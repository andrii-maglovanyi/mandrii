import { describe, expect, it } from "vitest";

import { Event_Status_Enum } from "~/types";

import { getEffectiveEventStatus } from "./status";

describe("getEffectiveEventStatus", () => {
  it("keeps an open-ended recurring event active after its original occurrence", () => {
    expect(
      getEffectiveEventStatus({
        is_recurring: true,
        recurrence_rule: "FREQ=WEEKLY",
        start_date: "2020-01-01T09:00:00.000Z",
        status: Event_Status_Enum.Active,
      }),
    ).toBe(Event_Status_Enum.Active);
  });

  it("treats a finite recurring event as completed once its final occurrence has passed", () => {
    expect(
      getEffectiveEventStatus({
        is_recurring: true,
        recurrence_rule: "FREQ=DAILY;COUNT=2",
        start_date: "2020-01-01T09:00:00.000Z",
        status: Event_Status_Enum.Active,
      }),
    ).toBe(Event_Status_Enum.Completed);
  });
});
