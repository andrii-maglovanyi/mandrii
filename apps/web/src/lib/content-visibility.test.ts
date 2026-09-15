import { describe, expect, it } from "vitest";

import {
  getDiscoverableEventsWhere,
  getDiscoverableVenuesWhere,
  getPubliclyViewableEventsWhere,
} from "./content-visibility";

describe("content discovery visibility", () => {
  it("keeps pending events out of every public query while preserving caller filters", () => {
    expect(getDiscoverableEventsWhere({ city: { _ilike: "%London%" } })).toEqual({
      _and: [{ status: { _eq: "ACTIVE" } }, { city: { _ilike: "%London%" } }],
    });
  });

  it("allows only active and archived reference venues on public surfaces", () => {
    expect(getDiscoverableVenuesWhere()).toEqual({
      _and: [{ status: { _in: ["ACTIVE", "ARCHIVED"] } }],
    });
  });

  it("keeps completed and archived events addressable without returning them to discovery", () => {
    expect(getPubliclyViewableEventsWhere({ slug: { _eq: "past-event" } })).toEqual({
      _and: [
        { status: { _in: ["ACTIVE", "COMPLETED", "ARCHIVED"] } },
        { slug: { _eq: "past-event" } },
      ],
    });
  });
});
