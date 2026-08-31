import { describe, expect, it } from "vitest";

import { communityRequestInputSchema } from "./validation";

const baseInput = {
  body: "I can offer a practical next step for this request.",
  category: "PRACTICAL_SUPPORT" as const,
  country: "United Kingdom",
  kind: "REQUEST" as const,
  location: "London",
  title: "Need practical help",
};

describe("communityRequestInputSchema", () => {
  it("allows one related venue or event", () => {
    expect(
      communityRequestInputSchema.safeParse({
        ...baseInput,
        relatedVenueId: "b4c913d1-9234-497b-9137-e6dfc7980b55",
      }).success,
    ).toBe(true);
  });

  it("rejects linking a post to both a venue and an event", () => {
    expect(
      communityRequestInputSchema.safeParse({
        ...baseInput,
        relatedEventId: "455efd7a-85d0-4720-9306-f0c1cd0a8736",
        relatedVenueId: "b4c913d1-9234-497b-9137-e6dfc7980b55",
      }).success,
    ).toBe(false);
  });

  it("allows a post to remain open for up to one year", () => {
    expect(communityRequestInputSchema.safeParse({ ...baseInput, expiresInDays: 365 }).success).toBe(true);
    expect(communityRequestInputSchema.safeParse({ ...baseInput, expiresInDays: 366 }).success).toBe(false);
  });
});
