import { describe, expect, it } from "vitest";

import { detectAddressType, isPotentiallyValidAddress } from "./address";

describe("detectAddressType", () => {
  const testCases = [
    { addr: "", expected: "invalid" },
    { addr: "   ", expected: "invalid" },
    { addr: "AB", expected: "invalid" },
    { addr: "a", expected: "invalid" },
    { addr: "ab", expected: "invalid" },

    { addr: "London", expected: "fuzzy" },
    { addr: "New York", expected: "fuzzy" },
    { addr: "Manhattan, NY", expected: "fuzzy" },
    { addr: "Paris, France", expected: "fuzzy" },
    { addr: "Downtown", expected: "fuzzy" },
    { addr: "123", expected: "fuzzy" },
    { addr: "Near the big park downtown", expected: "fuzzy" },
    { addr: "By the train station", expected: "fuzzy" },
    { addr: "Rue de la République", expected: "fuzzy" },
    { addr: "Via Roma", expected: "fuzzy" },
    { addr: "United Kingdom", expected: "fuzzy" },
    { addr: "United States", expected: "fuzzy" },
    { addr: "Charlton, Greenwich", expected: "fuzzy" },
    { addr: "Manhattan", expected: "fuzzy" },
    { addr: "Brooklyn", expected: "fuzzy" },
    { addr: "Los Angeles", expected: "fuzzy" },
    { addr: "Koog aan de Zaan", expected: "fuzzy" },
    { addr: "Борщагівка", expected: "fuzzy" },
    { addr: "Троєщина, Київ", expected: "fuzzy" },
    { addr: "Троєщина, Деснянскьий р-н., Київ", expected: "fuzzy" },

    { addr: "123 Main St", expected: "specific" },
    { addr: "45 Baker Street, London, SW1A 1AA", expected: "specific" },
    { addr: "10 Downing Street", expected: "specific" },
    { addr: "742 Evergreen Terrace, Springfield", expected: "specific" },
    { addr: "1600 Pennsylvania Avenue NW, Washington, DC 20500", expected: "specific" },
    { addr: "Behind the old library on Main", expected: "fuzzy" }, // Directional description = fuzzy
    { addr: "Opposite the shopping mall", expected: "fuzzy" }, // Directional description = fuzzy
    { addr: "東京都渋谷区神南1-2-3", expected: "specific" },
    { addr: "12 Rue de Rivoli", expected: "specific" },
    { addr: "42 Baker Street", expected: "specific" },
    { addr: "12-14 Baker Street", expected: "specific" },
    { addr: "221B Baker Street", expected: "specific" },
    { addr: "7 Machinistenstraat", expected: "specific" },
    { addr: "7 Machinistenstraat, Koog aan de Zaan", expected: "specific" },
    { addr: "7 Machinistenstraat, 1541AH", expected: "specific" },
    { addr: "45, Prince Harold Road, WU17ES", expected: "specific" },
    { addr: "123 Main St, London, SW1A 1AA", expected: "specific" },
    { addr: "10 Downing Street, Westminster, London", expected: "specific" },
    { addr: "1 Apple Park Way, Cupertino, CA 95014", expected: "specific" },
    { addr: "Apt 5, 100 Main Street", expected: "specific" },
    { addr: "Unit 12/34 Example Road", expected: "specific" },
    { addr: "Махова 5-б, Київ", expected: "specific" },
    { addr: "пр-т. Червоної Калини 11, Деснянський", expected: "specific" },
    { addr: "03134, Київ", expected: "specific" },
  ] as const;

  it.each(testCases)('detects "$addr" as $expected', ({ addr, expected }) => {
    expect(detectAddressType(addr)).toBe(expected);
  });

  describe("edge cases", () => {
    it("handles addresses with extra whitespace", () => {
      expect(detectAddressType("  123 Main Street  ")).toBe("specific");
      expect(detectAddressType("  London  ")).toBe("fuzzy");
    });

    it("handles addresses with multiple separators", () => {
      expect(detectAddressType("12-14/B Baker Street")).toBe("specific");
    });
  });
});

describe("isPotentiallyValidAddress", () => {
  it("returns false for invalid addresses", () => {
    expect(isPotentiallyValidAddress("")).toBe(false);
    expect(isPotentiallyValidAddress("ab")).toBe(false);
    expect(isPotentiallyValidAddress("  ")).toBe(false);
  });

  it("returns true for fuzzy addresses", () => {
    expect(isPotentiallyValidAddress("London")).toBe(true);
    expect(isPotentiallyValidAddress("New York")).toBe(true);
  });

  it("returns true for specific addresses", () => {
    expect(isPotentiallyValidAddress("123 Main Street")).toBe(true);
    expect(isPotentiallyValidAddress("10 Downing Street, London")).toBe(true);
  });
});
