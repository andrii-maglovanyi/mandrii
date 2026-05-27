/**
 * Cross-country invariant tests
 *
 * These tests verify properties that MUST hold for all country calculators:
 * - Finite outputs for all default inputs
 * - Correct mortgage-term boundary behaviour (equity never inflated beyond term)
 * - Chart year N is consistent with calculate() at year N
 * - Zero-principal edge cases
 * - Higher appreciation → better buying
 * - Higher mortgage rate → worse buying
 */

import { describe, it, expect } from "vitest";
import { calculate as calculateGB, buildChartData as chartGB } from "../GB/formulas";
import { calculate as calculateDE, buildChartData as chartDE } from "../DE/formulas";
import { calculate as calculatePL, buildChartData as chartPL } from "../PL/formulas";
import { DEFAULT_INPUTS_GB } from "../GB/defaults";
import { DEFAULT_INPUTS_DE } from "../DE/defaults";
import { DEFAULT_INPUTS_PL } from "../PL/defaults";

const COUNTRIES = [
  { name: "GB", calculate: calculateGB, buildChartData: chartGB, defaults: DEFAULT_INPUTS_GB },
  { name: "DE", calculate: calculateDE, buildChartData: chartDE, defaults: DEFAULT_INPUTS_DE },
  { name: "PL", calculate: calculatePL, buildChartData: chartPL, defaults: DEFAULT_INPUTS_PL },
] as const;

// ── All countries: finite outputs ─────────────────────────────────────────────

describe.each(COUNTRIES)("$name - outputs are always finite for default inputs", ({ calculate, defaults }) => {
  const result = calculate(defaults as never);

  it("buyingNet is finite", () => expect(Number.isFinite(result.buyingNet)).toBe(true));
  it("rentingNet is finite", () => expect(Number.isFinite(result.rentingNet)).toBe(true));
  it("equity is finite", () => expect(Number.isFinite(result.equity)).toBe(true));
  it("monthlyMortgage is finite", () => expect(Number.isFinite(result.monthlyMortgage)).toBe(true));
  it("totalMortgagePayments is finite", () => expect(Number.isFinite(result.totalMortgagePayments)).toBe(true));
});

// ── All countries: equity never goes negative beyond mortgage term ─────────────

describe.each(COUNTRIES)("$name - equity non-negative beyond mortgage term", ({ calculate, defaults }) => {
  it("equity >= 0 when years >> mortgageTerm", () => {
    const result = calculate({ ...defaults, years: 40, mortgageTerm: 25 } as never);
    expect(result.equity).toBeGreaterThanOrEqual(0);
  });

  it("mortgage payments cap at mortgage term (not at years)", () => {
    const longStay = calculate({ ...defaults, years: 40, mortgageTerm: 25 } as never);
    const exactTerm = calculate({ ...defaults, years: 25, mortgageTerm: 25 } as never);
    // Long stay shouldn't accumulate more mortgage payments than full-term stay
    expect(longStay.totalMortgagePayments).toBe(exactTerm.totalMortgagePayments);
  });
});

// ── All countries: chart consistency with calculate() ────────────────────────

describe.each(COUNTRIES)(
  "$name - chart year N is consistent with calculate() at year N",
  ({ calculate, buildChartData, defaults }) => {
    it("chart buying at user's year matches calculate() buyingNet magnitude (within £/€/zł 2)", () => {
      const inputs = { ...defaults } as never;
      const result = calculate(inputs);
      const data = buildChartData(inputs);
      const horizon = (defaults as { years: number }).years;
      const chartPoint = data[horizon - 1];
      expect(Math.abs(chartPoint.buying - Math.abs(result.buyingNet))).toBeLessThan(2);
    });

    it("chart returns at least 40 data points", () => {
      const data = buildChartData({ ...defaults } as never);
      expect(data.length).toBeGreaterThanOrEqual(40);
    });

    it("chart values are all finite", () => {
      const data = buildChartData({ ...defaults } as never);
      data.forEach((d) => {
        expect(Number.isFinite(d.buying)).toBe(true);
        expect(Number.isFinite(d.renting)).toBe(true);
      });
    });
  },
);

// ── All countries: economic direction invariants ──────────────────────────────

describe.each(COUNTRIES)("$name - economic direction invariants", ({ calculate, defaults }) => {
  it("higher appreciation → better buyingNet", () => {
    const low = calculate({ ...defaults, propertyAppreciation: 1 } as never);
    const high = calculate({ ...defaults, propertyAppreciation: 8 } as never);
    expect(high.buyingNet).toBeGreaterThan(low.buyingNet);
  });

  it("higher mortgage rate → worse buyingNet", () => {
    const low = calculate({ ...defaults, mortgageRate: 2 } as never);
    const high = calculate({ ...defaults, mortgageRate: 9 } as never);
    expect(high.buyingNet).toBeLessThan(low.buyingNet);
  });

  it("very low rent → renting wins", () => {
    const { buyingNet, rentingNet } = calculate({ ...defaults, monthlyRent: 200 } as never);
    expect(rentingNet).toBeGreaterThan(buyingNet);
  });

  it("zero deposit → valid output (100% LTV mortgage)", () => {
    const result = calculate({ ...defaults, deposit: 0 } as never);
    expect(Number.isFinite(result.buyingNet)).toBe(true);
    expect(Number.isFinite(result.monthlyMortgage)).toBe(true);
  });

  it("deposit >= propertyValue → no mortgage", () => {
    const pv = (defaults as { propertyValue: number }).propertyValue;
    const result = calculate({ ...defaults, deposit: pv } as never);
    expect(result.monthlyMortgage).toBe(0);
    expect(result.totalMortgagePayments).toBe(0);
  });

  it("years = 1 → finite outputs", () => {
    const result = calculate({ ...defaults, years: 1 } as never);
    expect(Number.isFinite(result.buyingNet)).toBe(true);
    expect(Number.isFinite(result.rentingNet)).toBe(true);
  });
});
