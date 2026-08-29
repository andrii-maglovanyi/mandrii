import { describe, expect, it } from "vitest";

import { getEventsFilter } from "./getEventsFilter";

describe("getEventsFilter", () => {
  it("keeps date, location and search restrictions together", () => {
    const { variables } = getEventsFilter({
      city: "Amsterdam",
      country: "Netherlands",
      dateFrom: "2026-08-28",
      dateTo: "2026-08-30",
      name: "concert",
    });

    expect(variables.where.country).toEqual({ _eq: "Netherlands" });
    expect(variables.where.city).toEqual({ _ilike: "%Amsterdam%" });
    expect(variables.where._and).toEqual([
      {
        _or: [
          { end_date: { _gte: "2026-08-28", _lte: "2026-08-30T23:59:59.999Z" } },
          { start_date: { _gte: "2026-08-28", _lte: "2026-08-30T23:59:59.999Z" } },
        ],
      },
      expect.objectContaining({ _or: expect.any(Array) }),
    ]);
  });

  it("combines nearby, upcoming and name filters without dropping any of them", () => {
    const { variables } = getEventsFilter({
      geo: { lat: 52.3676, lng: 4.9041 },
      name: "concert",
    });

    expect(variables.where._and).toHaveLength(3);
    expect(variables.where._or).toBeUndefined();
  });
});
