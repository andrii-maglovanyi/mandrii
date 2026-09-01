import { describe, expect, it } from "vitest";

import { getSettlementRoute } from "./settlementRoutes";

describe("settlementRoutes", () => {
  it("keeps the UK route in an explicit, practical order", () => {
    const route = getSettlementRoute("gb");

    expect(route?.coreStages.map(({ id }) => id)).toEqual([
      "status-and-documents",
      "home-and-address",
      "healthcare",
      "work-and-money",
      "everyday-life",
    ]);
  });

  it("does not present incomplete guides as actionable", () => {
    const route = getSettlementRoute("gb");

    expect(route?.coreStages.every((guide) => guide.availability === "coming-soon" && !guide.href)).toBe(true);
    expect(route?.optionalStages.every((guide) => guide.availability === "coming-soon" && !guide.href)).toBe(true);
  });

  it("returns no route for countries whose content has not been prepared", () => {
    expect(getSettlementRoute("nl")).toBeNull();
  });
});
