type GenericItem = { images?: null | string[]; logo?: null | string };

interface ItemWithLayout<T> {
  hasImage: boolean;
  item: T;
  layoutSize: LayoutSize;
}

type LayoutSize = "full" | "half" | "small" | "third";

const LAYOUT_PATTERNS: Array<Array<{ count: number; size: LayoutSize }>> = [
  [{ count: 1, size: "full" }],
  [{ count: 2, size: "half" }],
  [{ count: 4, size: "small" }],
  [
    { count: 1, size: "half" },
    { count: 2, size: "small" },
  ],
  [
    { count: 2, size: "small" },
    { count: 1, size: "half" },
  ],
];

export const generateCatalogLayouts = <T extends GenericItem>(
  items: Array<T>,
  isNotLastPage: boolean,
): ItemWithLayout<T>[] => {
  const layouts: ItemWithLayout<T>[] = [];
  let itemIndex = 0;

  while (itemIndex < items.length) {
    const remainingItems = items.length - itemIndex;

    const hasImage = (index: number) => Boolean(items[index].logo ?? items[index].images?.length);

    if (isNotLastPage && remainingItems < 5) {
      if (remainingItems === 1) {
        // 1 venue - make it full width
        layouts.push({
          hasImage: hasImage(itemIndex),
          item: items[itemIndex],
          layoutSize: "full",
        });
        itemIndex++;
      } else if (remainingItems === 2) {
        // 2 venues - make them half width each (2 + 2 = 4 columns)
        for (let i = 0; i < 2; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            item: items[itemIndex],
            layoutSize: "half",
          });
          itemIndex++;
        }
      } else if (remainingItems === 3) {
        // 3 venues - one half and two small (2 + 1 + 1 = 4 columns)
        layouts.push({
          hasImage: hasImage(itemIndex),
          item: items[itemIndex],
          layoutSize: "half",
        });
        itemIndex++;
        for (let i = 0; i < 2; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            item: items[itemIndex],
            layoutSize: "small",
          });
          itemIndex++;
        }
      } else if (remainingItems === 4) {
        // 4 venues - all small (1 + 1 + 1 + 1 = 4 columns)
        for (let i = 0; i < 4; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            item: items[itemIndex],
            layoutSize: "small",
          });
          itemIndex++;
        }
      }
    } else {
      const pattern = LAYOUT_PATTERNS[Math.floor(Math.random() * LAYOUT_PATTERNS.length)];

      for (const segment of pattern) {
        for (let i = 0; i < segment.count && itemIndex < items.length; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            item: items[itemIndex],
            layoutSize: segment.size,
          });
          itemIndex++;
        }
      }
    }
  }

  return layouts;
};
