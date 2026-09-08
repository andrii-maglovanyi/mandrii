import { describe, expect, it } from "vitest";

import { getSavedMapArea, getSavedMapAreaHref } from "./savedArea";

describe("saved map area", () => {
  it("makes a map link that preserves its centre and radius", () => {
    expect(getSavedMapAreaHref({ latitude: 52.37, longitude: 4.89, radiusMeters: 10_000 })).toBe(
      "/map?areaLat=52.37&areaLng=4.89&areaRadius=10000#venues",
    );
    expect(getSavedMapAreaHref({ latitude: 52.37, longitude: 4.89, radiusMeters: 10_000 }, "events")).toBe(
      "/map?areaLat=52.37&areaLng=4.89&areaRadius=10000#events",
    );
  });

  it("reads a valid map area from the URL", () => {
    expect(getSavedMapArea(new URLSearchParams("areaLat=51.5&areaLng=-0.1&areaRadius=3000"))).toEqual({
      latitude: 51.5,
      longitude: -0.1,
      radiusMeters: 3000,
    });
  });

  it("ignores incomplete or unsafe URL values", () => {
    expect(getSavedMapArea(new URLSearchParams("areaLat=300&areaLng=0&areaRadius=1000"))).toBeNull();
    expect(getSavedMapArea(new URLSearchParams("areaLat=52&areaLng=4&areaRadius=999999"))).toBeNull();
  });
});
