import { describe, it, expect } from "vitest";
import { pmt, remainingBalance, getLtvClass } from "./helpers";

/** Round to 2 decimal places */
const r2 = (n: number) => Math.round(n * 100) / 100;

// ── getLtvClass ───────────────────────────────────────────────────────────────

describe("getLtvClass", () => {
  const brackets = { risk: 95, normal: 80 };

  it("returns danger class when LTV > risk threshold", () => {
    const cls = getLtvClass(96, brackets);
    expect(cls).toContain("red");
  });

  it("returns warning class when LTV is between normal and risk", () => {
    const cls = getLtvClass(85, brackets);
    expect(cls).toContain("amber");
  });

  it("returns ok class when LTV is at or below normal threshold", () => {
    const cls = getLtvClass(80, brackets);
    expect(cls).toContain("blue");
  });

  it("returns ok class when LTV is 0", () => {
    const cls = getLtvClass(0, brackets);
    expect(cls).toContain("blue");
  });

  it("boundary: LTV exactly at risk threshold returns warning (not danger)", () => {
    // >95 is danger; exactly 95 falls into the amber branch
    const cls = getLtvClass(95, brackets);
    expect(cls).toContain("amber");
  });

  it("works with different bracket values (German: risk=80, normal=60)", () => {
    const deBrackets = { risk: 80, normal: 60 };
    expect(getLtvClass(85, deBrackets)).toContain("red");
    expect(getLtvClass(70, deBrackets)).toContain("amber");
    expect(getLtvClass(50, deBrackets)).toContain("blue");
  });
});

// ── pmt ───────────────────────────────────────────────────────────────────────

describe("pmt", () => {
  it("returns 0 for zero principal", () => {
    expect(pmt(4.5, 30, 0)).toBe(0);
  });

  it("returns 0 for negative principal (deposit > value)", () => {
    expect(pmt(4.5, 30, -50_000)).toBe(0);
  });

  it("returns 0 for zero term", () => {
    expect(pmt(4.5, 0, 100_000)).toBe(0);
  });

  it("handles zero interest rate (interest-free mortgage)", () => {
    // £120,000 over 10 years at 0% → £1,000/mo exactly
    expect(r2(pmt(0, 10, 120_000))).toBe(1_000);
  });

  it("higher rate → higher payment", () => {
    expect(pmt(5.0, 30, 300_000)).toBeGreaterThan(pmt(3.0, 30, 300_000));
  });

  it("shorter term → higher payment", () => {
    expect(pmt(4.5, 15, 300_000)).toBeGreaterThan(pmt(4.5, 30, 300_000));
  });

  it("standard annuity formula verification: £450k at 4.5% over 30yr → ~£2,280.08/mo", () => {
    expect(r2(pmt(4.5, 30, 450_000))).toBe(2_280.08);
  });
});

// ── remainingBalance ──────────────────────────────────────────────────────────

describe("remainingBalance", () => {
  it("returns full principal after 0 payments", () => {
    expect(r2(remainingBalance(4.5, 30, 300_000, 0))).toBe(300_000);
  });

  it("returns 0 after full term of payments", () => {
    expect(r2(remainingBalance(4.5, 30, 300_000, 30 * 12))).toBe(0);
  });

  it("returns 0 for zero principal", () => {
    expect(remainingBalance(4.5, 30, 0, 60)).toBe(0);
  });

  it("decreases monotonically with more payments", () => {
    const b1 = remainingBalance(4.5, 30, 300_000, 12);
    const b2 = remainingBalance(4.5, 30, 300_000, 24);
    const b3 = remainingBalance(4.5, 30, 300_000, 60);
    expect(b2).toBeLessThan(b1);
    expect(b3).toBeLessThan(b2);
  });

  it("handles zero interest rate", () => {
    // £120,000 over 10 years, 0% - linear reduction
    // After 1 year (12 payments): 120000 - 12 × 1000 = 108000
    expect(r2(remainingBalance(0, 10, 120_000, 12))).toBe(108_000);
  });

  it("never returns negative - clamped to 0 beyond mortgage term", () => {
    // 30-year mortgage - asking for balance after 40 years should be 0, not negative
    expect(remainingBalance(4.5, 30, 300_000, 40 * 12)).toBe(0);
    expect(remainingBalance(4.5, 30, 300_000, 35 * 12)).toBe(0);
  });

  it("result is always >= 0 for any valid input combination", () => {
    const principals = [0, 50_000, 200_000, 500_000];
    const rates = [0, 1, 4.5, 8];
    const terms = [5, 15, 25, 30];
    const payments = [0, 12, 120, 300, 500];
    for (const principal of principals) {
      for (const rate of rates) {
        for (const term of terms) {
          for (const n of payments) {
            expect(remainingBalance(rate, term, principal, n)).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });
});
