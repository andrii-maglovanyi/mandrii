import { describe, expect, it } from "vitest";

import { generateCatalogLayouts } from "./layoutConfig";

describe("generateCatalogLayouts", () => {
  it("keeps the same layout for the same result set", () => {
    const items = Array.from({ length: 8 }, (_, id) => ({ id: String(id), images: id % 2 ? ["image.jpg"] : [] }));

    expect(generateCatalogLayouts(items, false)).toEqual(generateCatalogLayouts(items, false));
  });

  it("marks items with an image for the card renderer", () => {
    const layouts = generateCatalogLayouts(
      [
        { id: "with-image", images: ["image.jpg"] },
        { id: "without-image", images: [] },
      ],
      false,
    );

    expect(layouts.map(({ hasImage }) => hasImage)).toEqual([true, false]);
  });
});
