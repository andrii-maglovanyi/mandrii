import { describe, expect, it } from "vitest";

import {
  appendDiscoveryCommunityLocationToUrl,
  appendDiscoveryLocationToUrl,
  normalizeDiscoveryCity,
  removeDiscoveryCityFromUrl,
} from "./discoveryLocation";

describe("discovery location utilities", () => {
  it("normalizes a Google place label to its city", () => {
    expect(normalizeDiscoveryCity("Amsterdam, Netherlands")).toBe("Amsterdam");
  });

  it("keeps an existing query while appending the selected location", () => {
    expect(
      appendDiscoveryLocationToUrl("/events?when=weekend", {
        city: "Amsterdam",
        countryCode: "nl",
      }),
    ).toBe("/events?when=weekend&country=Netherlands&city=Amsterdam");
  });

  it("uses Community's location query without changing venue and event URL behaviour", () => {
    expect(
      appendDiscoveryCommunityLocationToUrl("/community?kind=REQUEST#latest", {
        city: "Amsterdam",
        countryCode: "nl",
      }),
    ).toBe("/community?kind=REQUEST&country=Netherlands&location=Amsterdam#latest");
  });

  it("does not add empty location values", () => {
    expect(appendDiscoveryLocationToUrl("/map", { city: "", countryCode: "" })).toBe("/map");
  });

  it("keeps the active filters while broadening a city search to its country", () => {
    expect(removeDiscoveryCityFromUrl("/venues?categories=SCHOOL%2CCAFE&country=Netherlands&city=Amsterdam")).toBe(
      "/venues?categories=SCHOOL%2CCAFE&country=Netherlands",
    );
  });
});
