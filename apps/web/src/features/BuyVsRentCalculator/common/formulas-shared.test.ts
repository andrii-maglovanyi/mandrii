import { describe, it, expect } from "vitest";
import { fvLump, totalRentPaid, totalMaintenanceCosts, returnOnOngoingSavings, safe } from "./formulas-shared";

/** Round to 2 decimal places */
const r2 = (n: number) => Math.round(n * 100) / 100;

// ── safe ──────────────────────────────────────────────────────────────────────

describe("safe", () => {
  it("returns the number when finite", () => {
    expect(safe(42)).toBe(42);
    expect(safe(0)).toBe(0);
    expect(safe(-100)).toBe(-100);
  });

  it("returns fallback (0) for NaN", () => {
    expect(safe(NaN)).toBe(0);
  });

  it("returns fallback (0) for Infinity", () => {
    expect(safe(Infinity)).toBe(0);
    expect(safe(-Infinity)).toBe(0);
  });

  it("uses custom fallback when provided", () => {
    expect(safe(NaN, 5)).toBe(5);
    expect(safe(Infinity, 10)).toBe(10);
  });

  it("does not replace valid 0 with fallback", () => {
    expect(safe(0, 99)).toBe(0);
  });
});

// ── fvLump ────────────────────────────────────────────────────────────────────

describe("fvLump", () => {
  it("returns principal when rate is 0%", () => {
    expect(fvLump(10_000, 0, 5)).toBe(10_000);
  });

  it("doubles principal at 100% rate after 1 year", () => {
    expect(fvLump(10_000, 100, 1)).toBe(20_000);
  });

  it("compounds correctly at 5% over 10 years", () => {
    // 10000 × (1.05)^10 ≈ 16288.95
    expect(r2(fvLump(10_000, 5, 10))).toBe(16_288.95);
  });

  it("returns principal when years is 0", () => {
    expect(fvLump(5_000, 4, 0)).toBe(5_000);
  });
});

// ── totalRentPaid ─────────────────────────────────────────────────────────────

describe("totalRentPaid", () => {
  it("flat rent (0% increase) = monthlyRent × 12 × years", () => {
    expect(totalRentPaid(1_000, 0, 5)).toBe(60_000);
  });

  it("rent increases compound annually", () => {
    // Year 1: 1000×12=12000; Year 2: 1030×12=12360; total=24360
    expect(r2(totalRentPaid(1_000, 3, 2))).toBe(24_360);
  });

  it("returns 0 for 0 years", () => {
    expect(totalRentPaid(1_000, 3, 0)).toBe(0);
  });

  it("higher rent increase results in more total rent paid", () => {
    const low = totalRentPaid(1_000, 1, 10);
    const high = totalRentPaid(1_000, 5, 10);
    expect(high).toBeGreaterThan(low);
  });
});

// ── totalMaintenanceCosts ─────────────────────────────────────────────────────

describe("totalMaintenanceCosts", () => {
  it("includes initial repair costs", () => {
    const result = totalMaintenanceCosts(100_000, 0, 0, 5_000, 1);
    // 0 maintenance + 5000 repairs
    expect(result).toBe(5_000);
  });

  it("calculates maintenance as pct of growing property value", () => {
    // Year 1: 100000 × 1% = 1000; no repairs; 1 year
    expect(totalMaintenanceCosts(100_000, 0, 1, 0, 1)).toBe(1_000);
  });

  it("property value grows with appreciation before applying maintenance", () => {
    // Year 1: 100000 × 1% = 1000; Year 2: 110000 × 1% = 1100; total = 2100 (at 10% growth)
    expect(r2(totalMaintenanceCosts(100_000, 10, 1, 0, 2))).toBe(2_100);
  });

  it("returns only repair costs when maintenance % is 0 and years > 0", () => {
    expect(totalMaintenanceCosts(500_000, 5, 0, 10_000, 7)).toBe(10_000);
  });
});

// ── returnOnOngoingSavings ────────────────────────────────────────────────────

describe("returnOnOngoingSavings", () => {
  it("returns 0 when rent equals mortgage (no surplus)", () => {
    expect(returnOnOngoingSavings(1_000, 0, 1_000, 5, 10)).toBe(0);
  });

  it("returns 0 when rent exceeds mortgage (renter pays more, no surplus to invest)", () => {
    expect(returnOnOngoingSavings(2_000, 0, 1_000, 5, 10)).toBe(0);
  });

  it("returns positive value when mortgage exceeds rent", () => {
    const result = returnOnOngoingSavings(500, 0, 1_000, 5, 10);
    expect(result).toBeGreaterThan(0);
  });

  it("returns only investment gain (not including principal deposited)", () => {
    // With 0% return, gain should be 0 even if there's surplus
    expect(returnOnOngoingSavings(500, 0, 1_000, 0, 5)).toBe(0);
  });

  it("higher savings rate produces higher return", () => {
    const low = returnOnOngoingSavings(500, 0, 2_000, 2, 10);
    const high = returnOnOngoingSavings(500, 0, 2_000, 8, 10);
    expect(high).toBeGreaterThan(low);
  });

  it("rent increases reduce surplus over time", () => {
    // High rent growth → less surplus in later years → lower cumulative return
    const lowIncrease = returnOnOngoingSavings(500, 1, 2_000, 5, 20);
    const highIncrease = returnOnOngoingSavings(500, 10, 2_000, 5, 20);
    expect(lowIncrease).toBeGreaterThan(highIncrease);
  });
});
