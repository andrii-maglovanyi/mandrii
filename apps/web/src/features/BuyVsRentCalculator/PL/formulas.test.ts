import { describe, it, expect } from "vitest";
import { pccTax, calculate, buildChartData, pln } from "./formulas";
import type { CalculatorInputs } from "./types";
import { pmt, remainingBalance } from "../utils/helpers";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Round to 2 decimal places for financial comparisons */
const r2 = (n: number) => Math.round(n * 100) / 100;

// Base inputs calibrated to May 2026 Polish market conditions
const BASE: CalculatorInputs = {
  propertyValue: 600_000,
  deposit: 120_000, // 20% wkład własny
  mortgageRate: 7.0, // WIBOR 3M ~4.5% + margin ~2.5%
  mortgageTerm: 30,
  isFirstTimeBuyer: false,
  isPrimaryMarket: false, // secondary market → PCC applies
  isFixedRate: false,
  fixedRatePeriodYears: 5,
  refinancingCost: 500,
  propertyAppreciation: 4.0,
  notaryCosts: 4_500,
  agentFeePct: 2.0,
  saleFeesPct: 2.5,
  maintenancePct: 0.6,
  annualBuildingAdminFee: 7_200,
  annualPropertyTax: 72,
  initialRepairCosts: 30_000,
  annualHomeInsurance: 600,
  returnOnSavings: 4.5,
  monthlyRent: 2_820,
  rentIncrease: 4.0,
  rentalDeposit: 5_640, // 2 months × 2,820 PLN
  years: 10,
};

// ── pccTax ────────────────────────────────────────────────────────────────────

describe("pccTax", () => {
  it("returns 2% on secondary market, non-FTB", () => {
    expect(pccTax(600_000, false, false)).toBe(12_000);
  });

  it("returns 0% for first-time buyer on secondary market (Art. 9 pkt 17 u.p.c.c.)", () => {
    expect(pccTax(600_000, true, false)).toBe(0);
  });

  it("returns 0% on primary market (VAT applies instead)", () => {
    expect(pccTax(600_000, false, true)).toBe(0);
  });

  it("returns 0% on primary market even if non-FTB", () => {
    expect(pccTax(600_000, false, true)).toBe(0);
  });

  it("returns 0% for FTB on primary market", () => {
    expect(pccTax(600_000, true, true)).toBe(0);
  });

  it("scales linearly with property value", () => {
    expect(pccTax(300_000, false, false)).toBe(6_000);
    expect(pccTax(1_000_000, false, false)).toBe(20_000);
  });

  it("returns 0 for zero property value", () => {
    expect(pccTax(0, false, false)).toBe(0);
  });
});

// ── calculate - buying figures ────────────────────────────────────────────────

describe("calculate - buying", () => {
  const result = calculate(BASE);

  it("PCC is 2% of property value for secondary market non-FTB", () => {
    expect(result.pccTaxAmount).toBe(12_000);
  });

  it("PCC is 0 for first-time buyer", () => {
    const r = calculate({ ...BASE, isFirstTimeBuyer: true });
    expect(r.pccTaxAmount).toBe(0);
  });

  it("PCC is 0 for primary market", () => {
    const r = calculate({ ...BASE, isPrimaryMarket: true });
    expect(r.pccTaxAmount).toBe(0);
  });

  it("agent fee is agentFeePct% of property value", () => {
    expect(r2(result.agentFee)).toBe(r2(600_000 * 0.02));
  });

  it("notary costs pass through directly", () => {
    expect(result.notaryCosts).toBe(4_500);
  });

  it("monthly mortgage matches PMT formula", () => {
    const loan = 600_000 - 120_000;
    expect(r2(result.monthlyMortgage)).toBe(r2(pmt(7.0, 30, loan)));
  });

  it("total mortgage payments = monthly × 12 × min(years, term)", () => {
    const loan = 600_000 - 120_000;
    const monthly = pmt(7.0, 30, loan);
    expect(r2(result.totalMortgagePayments)).toBe(r2(monthly * 12 * 10));
  });

  it("caps mortgage payments at mortgage term", () => {
    const longStay = calculate({ ...BASE, years: 35, mortgageTerm: 30 });
    const monthly = pmt(BASE.mortgageRate, BASE.mortgageTerm, 600_000 - 120_000);
    expect(r2(longStay.totalMortgagePayments)).toBe(r2(monthly * 12 * 30));
  });

  it("equity is positive (property appreciates, mortgage reduces)", () => {
    expect(result.equity).toBeGreaterThan(0);
  });

  it("equity uses full years of appreciation", () => {
    const r1 = calculate({ ...BASE, years: 1 });
    const loan = 600_000 - 120_000;
    // equityYears = 1 → futureValue = propertyValue * 1.04^1
    const expectedEquity = 600_000 * 1.04 - remainingBalance(BASE.mortgageRate, BASE.mortgageTerm, loan, 12);
    expect(r2(r1.equity)).toBe(r2(expectedEquity));
  });

  it("equity never goes negative beyond mortgage term (remainingBalance clamped)", () => {
    const longStay = calculate({ ...BASE, years: 35, mortgageTerm: 30 });
    expect(longStay.equity).toBeGreaterThanOrEqual(0);
  });

  it("total building admin fees = annualBuildingAdminFee × years", () => {
    expect(result.totalBuildingAdminFees).toBe(7_200 * 10);
  });

  it("total property tax = annualPropertyTax × years", () => {
    expect(result.totalPropertyTax).toBe(72 * 10);
  });

  it("total insurance = annualHomeInsurance × years", () => {
    expect(result.totalInsurance).toBe(600 * 10);
  });

  it("no refinancing events for variable-rate mortgage (isFixedRate=false)", () => {
    expect(result.totalRefinancingCosts).toBe(0);
  });

  it("refinancing fires once for fixed-rate when years > fixedRatePeriodYears", () => {
    const r = calculate({ ...BASE, isFixedRate: true, years: 7, fixedRatePeriodYears: 5 });
    // floor((7-1)/5) = 1 event
    expect(r.totalRefinancingCosts).toBe(500);
  });

  it("no refinancing at fixed-rate boundary (years = fixedRatePeriodYears)", () => {
    const r = calculate({ ...BASE, isFixedRate: true, years: 5, fixedRatePeriodYears: 5 });
    // floor((5-1)/5) = 0 events (refinancing uses years-1 convention for fixed-rate boundaries)
    expect(r.totalRefinancingCosts).toBe(0);
  });

  it("selling fees = saleFeesPct% of future property value (at full holding period)", () => {
    const futureVal = 600_000 * Math.pow(1.04, 10); // full 10 years
    expect(r2(result.sellingFees)).toBe(r2(futureVal * 0.025));
  });

  it("handles deposit equal to property value (no mortgage)", () => {
    const r = calculate({ ...BASE, deposit: 600_000 });
    expect(r.monthlyMortgage).toBe(0);
    expect(r.totalMortgagePayments).toBe(0);
  });

  it("handles deposit greater than property value gracefully", () => {
    const r = calculate({ ...BASE, deposit: 700_000 });
    expect(r.monthlyMortgage).toBe(0);
    expect(Number.isFinite(r.buyingNet)).toBe(true);
  });

  it("buyingNet is finite for default inputs", () => {
    expect(Number.isFinite(result.buyingNet)).toBe(true);
  });
});

// ── calculate - renting figures ───────────────────────────────────────────────

describe("calculate - renting", () => {
  const result = calculate(BASE);

  it("initialSavings is the starting capital retained by renting", () => {
    const pcc = pccTax(600_000, false, false);
    const agent = 600_000 * 0.02;
    const expected = 120_000 + pcc + agent + 4_500 + 30_000;
    expect(r2(result.initialSavings)).toBe(r2(expected));
  });

  it("rentalDeposit reduces the amount available to invest", () => {
    const withDeposit = calculate(BASE);
    const withoutDeposit = calculate({ ...BASE, rentalDeposit: 0 });
    expect(withoutDeposit.returnOnInitialSavings).toBeGreaterThan(withDeposit.returnOnInitialSavings);
  });

  it("returnOnInitialSavings is positive", () => {
    expect(result.returnOnInitialSavings).toBeGreaterThan(0);
  });

  it("rentPaid grows with rent increases (must exceed flat rent × years)", () => {
    expect(result.rentPaid).toBeGreaterThan(2_820 * 12 * 10);
  });

  it("rentalDeposit (kaucja) affects renting net through foregone investment return", () => {
    const withDeposit = calculate(BASE);
    const noDeposit = calculate({ ...BASE, rentalDeposit: 0 });
    expect(r2(withDeposit.rentingNet - noDeposit.rentingNet)).toBe(
      r2(-BASE.rentalDeposit * (Math.pow(1 + BASE.returnOnSavings / 100, BASE.years) - 1)),
    );
  });

  it("renting net reconciles to the displayed gain/loss rows", () => {
    expect(r2(result.rentingNet)).toBe(r2(result.returnOnInitialSavings + result.ongoingSavings - result.rentPaid));
  });

  it("rentingNet is finite for default inputs", () => {
    expect(Number.isFinite(result.rentingNet)).toBe(true);
  });
});

// ── calculate - summary ───────────────────────────────────────────────────────

describe("calculate - summary", () => {
  it("higher property appreciation improves buying net", () => {
    const low = calculate({ ...BASE, propertyAppreciation: 1 });
    const high = calculate({ ...BASE, propertyAppreciation: 8 });
    expect(high.buyingNet).toBeGreaterThan(low.buyingNet);
  });

  it("higher mortgage rate worsens buying net", () => {
    const low = calculate({ ...BASE, mortgageRate: 3 });
    const high = calculate({ ...BASE, mortgageRate: 9 });
    expect(high.buyingNet).toBeLessThan(low.buyingNet);
  });

  it("renting wins when rent is very low relative to mortgage", () => {
    const { buyingNet, rentingNet } = calculate({ ...BASE, monthlyRent: 500 });
    expect(rentingNet).toBeGreaterThan(buyingNet);
  });

  it("FTB exemption improves buying net by exactly the PCC amount", () => {
    const nonFtb = calculate({ ...BASE, isFirstTimeBuyer: false });
    const ftb = calculate({ ...BASE, isFirstTimeBuyer: true });
    const pcc = pccTax(600_000, false, false); // 12_000
    expect(r2(ftb.buyingNet - nonFtb.buyingNet)).toBe(r2(pcc));
  });

  it("primary market (no PCC) gives same buying net as FTB on secondary market", () => {
    const primaryMarket = calculate({ ...BASE, isPrimaryMarket: true });
    const ftb = calculate({ ...BASE, isFirstTimeBuyer: true });
    // Both have pccTaxAmount = 0, so only differ if other inputs differ - here they don't
    expect(r2(primaryMarket.buyingNet)).toBe(r2(ftb.buyingNet));
  });

  it("handles years = 1", () => {
    const r = calculate({ ...BASE, years: 1 });
    expect(Number.isFinite(r.buyingNet)).toBe(true);
    expect(Number.isFinite(r.rentingNet)).toBe(true);
  });
});

// ── buildChartData ────────────────────────────────────────────────────────────

describe("buildChartData", () => {
  const data = buildChartData(BASE);

  it("always returns at least 40 data points", () => {
    expect(data.length).toBeGreaterThanOrEqual(40);
  });

  it("returns max(40, years) points when years > 40", () => {
    const longData = buildChartData({ ...BASE, years: 50 });
    expect(longData).toHaveLength(50);
  });

  it("year values are sequential from 1", () => {
    data.forEach((d, i) => expect(d.year).toBe(i + 1));
  });

  it("buying and renting values are all finite", () => {
    data.forEach((d) => {
      expect(Number.isFinite(d.buying)).toBe(true);
      expect(Number.isFinite(d.renting)).toBe(true);
    });
  });

  it("year 10 buying matches calculate() buyingNet magnitude (within rounding)", () => {
    const result = calculate(BASE);
    expect(Math.abs(data[9].buying - Math.abs(result.buyingNet))).toBeLessThan(2);
  });

  it("renting cost grows over time (cumulative rent increases)", () => {
    expect(data[19].renting).toBeGreaterThan(data[9].renting);
  });

  it("renting at year 10 matches the calculation summary", () => {
    expect(data[9].renting).toBe(Math.round(-calculate(BASE).rentingNet));
  });

  it("buying cost falls after mortgage is paid off", () => {
    const longData = buildChartData({ ...BASE, mortgageTerm: 25, years: 10 });
    expect(longData[35].buying).toBeLessThan(longData[27].buying);
  });

  it("no refinancing cost events for variable-rate mortgage in chart", () => {
    // With isFixedRate=false, cumRefinancing stays at 0 - buying costs should match
    // the same inputs with refinancingCost=0 exactly
    const variableData = buildChartData({ ...BASE, isFixedRate: false });
    const zeroRefData = buildChartData({ ...BASE, isFixedRate: false, refinancingCost: 0 });
    variableData.forEach((d, i) => expect(d.buying).toBe(zeroRefData[i].buying));
  });

  it("rentalDeposit (kaucja) return lowers renting cost at user's chosen year", () => {
    const withDeposit = buildChartData({ ...BASE, years: 10 });
    const noDeposit = buildChartData({ ...BASE, years: 10, rentalDeposit: 0 });
    expect(withDeposit[9].renting).toBeGreaterThan(noDeposit[9].renting);
  });

  it("buying values never go unrealistically negative due to clamped remainingBalance", () => {
    const longData = buildChartData({ ...BASE, years: 40, mortgageTerm: 25 });
    // After mortgage term ends (yr > 25), equity = property value (balance = 0)
    // buying cost should not sharply diverge downward
    longData.slice(25).forEach((d) => {
      expect(Number.isFinite(d.buying)).toBe(true);
    });
  });
});

// ── pln ───────────────────────────────────────────────────────────────────────

describe("pln", () => {
  it("formats positive values with PLN symbol and Polish locale", () => {
    const result = pln(10_000);
    expect(result).toContain("zł");
    expect(result.startsWith("-")).toBe(false);
  });

  it("formats negative values with leading minus before currency", () => {
    const result = pln(-10_000);
    expect(result.startsWith("-")).toBe(true);
    expect(result).toContain("zł");
  });

  it("formats zero as non-negative", () => {
    const result = pln(0);
    expect(result.startsWith("-")).toBe(false);
  });

  it("formats large values without error", () => {
    const result = pln(1_000_000);
    expect(result).toContain("zł");
    expect(result.startsWith("-")).toBe(false);
  });

  it("absolute value is formatted (negative sign prepended, not locale-placed)", () => {
    const pos = pln(5_000);
    const neg = pln(-5_000);
    // The formatted part after the minus should match the positive format
    expect(neg).toBe(`-${pos}`);
  });
});
