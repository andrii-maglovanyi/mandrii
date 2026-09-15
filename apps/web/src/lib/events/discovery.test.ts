import { expect, it } from "vitest";
import { EventSchedule, orderEventsByIds, selectEventSchedules } from "./discovery";

const now = new Date("2026-09-01T00:00:00Z");
const event = { id: "weekly", start_date: "2025-09-01T12:00:00Z", end_date: null, is_recurring: true, recurrence_rule: "FREQ=WEEKLY" };
it("keeps recurrence filtering and ordering exact before selecting a page", () => {
  const schedules = [
    event,
    { ...event, id: "expired", recurrence_rule: "FREQ=WEEKLY;COUNT=2" },
    { ...event, id: "one-off", start_date: "2026-09-04T12:00:00Z", is_recurring: false },
  ] as EventSchedule[];
  expect(selectEventSchedules(schedules, { from: "2026-09-01", to: "2026-09-08" }, now).map(({id}) => id)).toEqual(["one-off", "weekly"]);
  expect(selectEventSchedules(schedules, { includePast: true }, now)).toHaveLength(3);
});
it("preserves schedule order if detail rows arrive in a different order or were deleted", () => {
  expect(orderEventsByIds([{id: "b"}, {id: "a"}], ["a", "deleted", "b"])).toEqual([{id: "a"}, {id: "b"}]);
});
