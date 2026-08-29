import { describe, expect, it } from "vitest";

import { getEventDatePreset } from "./getEventDatePreset";

describe("getEventDatePreset", () => {
  it("uses the current weekend on Saturday", () => {
    expect(getEventDatePreset("weekend", new Date(2026, 7, 29))).toEqual({
      dateFrom: "2026-08-28",
      dateTo: "2026-08-30",
    });
  });

  it("uses the upcoming weekend before Friday", () => {
    expect(getEventDatePreset("weekend", new Date(2026, 7, 24))).toEqual({
      dateFrom: "2026-08-28",
      dateTo: "2026-08-30",
    });
  });

  it("ignores an unknown preset", () => {
    expect(getEventDatePreset("today", new Date(2026, 7, 24))).toBeUndefined();
  });
});
