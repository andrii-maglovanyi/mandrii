import { describe, it, expect } from "vitest";
import { transferTax, transferTaxRate, calculate, buildChartData, eur } from "./formulas";
import type { CalculatorInputs } from "./types";
import { pmt, remainingBalance } from "../utils/helpers";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Round to 2 decimal places for financial comparisons */
const r2 = (n: number) => Math.round(n * 100) / 100;

// Default inputs based on DEFAULT_INPUTS_DE (Berlin, 5.5% GrESt)
const BASE: CalculatorInputs = {
  propertyValue: 400_000,
  deposit: 80_000,
  mortgageRate: 3.6,
  mortgageTerm: 30,
  stateGroup: "HB_MV_NI_ST", // 5.5%
  propertyAppreciation: 3.0,
  notaryAndLandRegistryCosts: 8_000,
  initialRepairCosts: 4_000,
  buyerAgentFeePct: 3.57,
  saleFeesPct: 3.57,
  maintenancePct: 0.8,
  annualHomeInsurance: 400,
  fixedRatePeriodYears: 10,
  refinancingCost: 400,
  annualCondoFee: 2_400,
  annualPropertyTax: 600,
  returnOnSavings: 3.5,
  monthlyRent: 1_500,
  rentIncrease: 3.0,
  rentalDeposit: Math.round(1_500 * 3),
  years: 10,
};

// ── transferTax ───────────────────────────────────────────────────────────────

describe("transferTax", () => {
  it("Bavaria & Saxony (BY_SN) — 3.5%", () => {
    expect(transferTax(400_000, "BY_SN")).toBe(14_000);
  });

  it("Hamburg (HH) — 4.0%", () => {
    expect(transferTax(400_000, "HH")).toBe(16_000);
  });

  it("Baden-Württemberg & Hesse (BW_HE) — 5.0%", () => {
    expect(transferTax(400_000, "BW_HE")).toBe(20_000);
  });

  it("Berlin etc. (BE_RP_TH) — 6.0%", () => {
    expect(transferTax(400_000, "BE_RP_TH")).toBe(24_000);
  });

  it("Brandenburg, NRW, etc. (BB_NW_SH_SL) — 6.5%", () => {
    expect(transferTax(400_000, "BB_NW_SH_SL")).toBe(26_000);
  });

  it("scales linearly with property value", () => {
    expect(transferTax(800_000, "BW_HE")).toBe(40_000);
  });

  it("returns 0 for zero property value", () => {
    expect(transferTax(0, "BY_SN")).toBe(0);
  });

  it("no cliff-edge (flat rate applies to full price)", () => {
    // Unlike UK SDLT, GrESt = rate × full price — result is exactly rate × value
    const rate = transferTaxRate("HB_MV_NI_ST");
    expect(transferTax(500_001, "HB_MV_NI_ST")).toBeCloseTo(500_001 * rate, 2);
  });
});

// ── transferTaxRate ───────────────────────────────────────────────────────────

describe("transferTaxRate", () => {
  it("returns correct rate for each state group", () => {
    expect(transferTaxRate("BY_SN")).toBe(0.035);
    expect(transferTaxRate("HH")).toBe(0.04);
    expect(transferTaxRate("BW_HE")).toBe(0.05);
    expect(transferTaxRate("HB_MV_NI_ST")).toBe(0.055);
    expect(transferTaxRate("BE_RP_TH")).toBe(0.06);
    expect(transferTaxRate("BB_NW_SH_SL")).toBe(0.065);
  });

  it("is consistent with transferTax (rate × value = tax)", () => {
    const pv = 350_000;
    for (const sg of ["BY_SN", "HH", "BW_HE", "HB_MV_NI_ST", "BE_RP_TH", "BB_NW_SH_SL"] as const) {
      expect(r2(transferTaxRate(sg) * pv)).toBe(r2(transferTax(pv, sg)));
    }
  });
});

// ── calculate — buying figures ─────────────────────────────────────────────────

describe("calculate — buying", () => {
  const result = calculate(BASE);

  it("transfer tax is 5.5% of property value", () => {
    expect(result.transferTaxAmount).toBe(22_000);
  });

  it("buyer agent fee is buyerAgentFeePct% of property value", () => {
    expect(r2(result.buyerAgentFee)).toBe(r2(400_000 * 0.0357));
  });

  it("monthly mortgage matches PMT formula", () => {
    const loanAmount = 400_000 - 80_000; // £320,000
    expect(r2(result.monthlyMortgage)).toBe(r2(pmt(3.6, 30, loanAmount)));
  });

  it("total mortgage payments = monthly × 12 × min(years, term)", () => {
    const monthly = pmt(3.6, 30, 320_000);
    expect(r2(result.totalMortgagePayments)).toBe(r2(monthly * 12 * 10));
  });

  it("equity is positive (property appreciates, mortgage reduces)", () => {
    expect(result.equity).toBeGreaterThan(0);
  });

  it("equity uses full years of appreciation", () => {
    // equity at years=1 should use equityYears=1 → futureValue = propertyValue * 1.03^1
    const result1 = calculate({ ...BASE, years: 1 });
    const loanAmount = 400_000 - 80_000;
    const expectedEquity = 400_000 * 1.03 - loanAmount;
    expect(r2(result1.equity)).toBe(r2(expectedEquity));
  });

  it("selling fees = saleFeesPct% of future property value", () => {
    // future value at full 10 years
    const futureVal = 400_000 * Math.pow(1.03, 10);
    expect(r2(result.sellingFees)).toBe(r2(futureVal * 0.0357));
  });

  it("total condo fees = annualCondoFee × years", () => {
    expect(result.totalCondoFees).toBe(2_400 * 10);
  });

  it("total property tax = annualPropertyTax × years", () => {
    expect(result.totalPropertyTax).toBe(600 * 10);
  });

  it("total insurance = annualHomeInsurance × years", () => {
    expect(result.totalInsurance).toBe(400 * 10);
  });

  it("one refinancing event at year 10 (fixedRatePeriodYears=10, years=10 → (10-1)/10 = 0 events)", () => {
    // With years=10 and fixedRatePeriodYears=10: floor((10-1)/10)=0 events
    expect(result.totalRefinancingCosts).toBe(0);
  });

  it("refinancing fires once when years > fixedRatePeriodYears", () => {
    const r = calculate({ ...BASE, years: 15, fixedRatePeriodYears: 10 });
    // floor((15-1)/10) = 1 event
    expect(r.totalRefinancingCosts).toBe(400);
  });

  it("caps mortgage payments at mortgage term", () => {
    const longStay = calculate({ ...BASE, years: 35, mortgageTerm: 30 });
    const monthly = pmt(BASE.mortgageRate, BASE.mortgageTerm, 400_000 - 80_000);
    expect(r2(longStay.totalMortgagePayments)).toBe(r2(monthly * 12 * 30));
  });

  it("handles deposit equal to property value (no mortgage)", () => {
    const result = calculate({ ...BASE, deposit: 400_000 });
    expect(result.monthlyMortgage).toBe(0);
    expect(result.totalMortgagePayments).toBe(0);
  });

  it("handles deposit greater than property value gracefully", () => {
    const result = calculate({ ...BASE, deposit: 500_000 });
    expect(result.monthlyMortgage).toBe(0);
    expect(Number.isFinite(result.buyingNet)).toBe(true);
  });
});

// ── calculate — renting figures ────────────────────────────────────────────────

describe("calculate — renting", () => {
  const result = calculate(BASE);

  it("initialSavings includes deposit + transferTax + agent + notary + repairs + 1yr insurance", () => {
    const transferTaxAmount = transferTax(400_000, "BE_RP_TH"); // 24000
    const agentFee = 400_000 * 0.0357;
    const expected = 80_000 + transferTaxAmount + agentFee + 8_000 + 4_000 + 400;
    expect(r2(result.initialSavings)).toBe(r2(expected));
  });

  it("initialSavingsBase excludes rentalDeposit (not investable)", () => {
    // rentingNet should be higher when rentalDeposit is 0 (all savings can be invested)
    const withDeposit = calculate(BASE);
    const withoutDeposit = calculate({ ...BASE, rentalDeposit: 0 });
    expect(withoutDeposit.returnOnInitialSavings).toBeGreaterThan(withDeposit.returnOnInitialSavings);
  });

  it("returnOnInitialSavings is positive", () => {
    expect(result.returnOnInitialSavings).toBeGreaterThan(0);
  });

  it("rentPaid is positive and grows with rent increases", () => {
    expect(result.rentPaid).toBeGreaterThan(1_500 * 12 * 10); // must be more than flat rent
  });

  it("rentalDeposit is returned at end (added to rentingNet)", () => {
    const withDeposit = calculate(BASE);
    const noDeposit = calculate({ ...BASE, rentalDeposit: 0 });
    // rentingNet with deposit should be higher by the deposit amount (returned at exit)
    expect(r2(withDeposit.rentingNet - noDeposit.rentingNet)).toBe(
      r2(
        BASE.rentalDeposit -
          (calculate(BASE).returnOnInitialSavings - calculate({ ...BASE, rentalDeposit: 0 }).returnOnInitialSavings),
      ),
    );
  });
});

// ── calculate — summary ────────────────────────────────────────────────────────

describe("calculate — summary", () => {
  it("higher property appreciation improves buying net", () => {
    const low = calculate({ ...BASE, propertyAppreciation: 1 });
    const high = calculate({ ...BASE, propertyAppreciation: 8 });
    expect(high.buyingNet).toBeGreaterThan(low.buyingNet);
  });

  it("higher mortgage rate worsens buying net", () => {
    const low = calculate({ ...BASE, mortgageRate: 1 });
    const high = calculate({ ...BASE, mortgageRate: 6 });
    expect(high.buyingNet).toBeLessThan(low.buyingNet);
  });

  it("renting wins when rent is very low relative to mortgage", () => {
    const { buyingNet, rentingNet } = calculate({ ...BASE, monthlyRent: 300 });
    expect(rentingNet).toBeGreaterThan(buyingNet);
  });

  it("higher state tax worsens buying net (more expensive to buy)", () => {
    const cheap = calculate({ ...BASE, stateGroup: "BY_SN" }); // 3.5%
    const expensive = calculate({ ...BASE, stateGroup: "BB_NW_SH_SL" }); // 6.5%
    expect(expensive.buyingNet).toBeLessThan(cheap.buyingNet);
  });

  it("handles years = 1", () => {
    const result = calculate({ ...BASE, years: 1 });
    expect(Number.isFinite(result.buyingNet)).toBe(true);
    expect(Number.isFinite(result.rentingNet)).toBe(true);
  });

  it("buyingNet and rentingNet are finite for default inputs", () => {
    const result = calculate(BASE);
    expect(Number.isFinite(result.buyingNet)).toBe(true);
    expect(Number.isFinite(result.rentingNet)).toBe(true);
  });
});

// ── buildChartData ─────────────────────────────────────────────────────────────

describe("buildChartData", () => {
  const data = buildChartData(BASE);

  it("always returns 40 data points for default inputs", () => {
    expect(data).toHaveLength(40);
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
    // chart buying is positive (cost), result buyingNet is negative (loss) — they should match in abs
    expect(Math.abs(data[9].buying - Math.abs(result.buyingNet))).toBeLessThan(2);
  });

  it("renting cost grows over time (cumulative rent increases)", () => {
    expect(data[19].renting).toBeGreaterThan(data[9].renting);
  });

  it("buying cost falls after mortgage is paid off", () => {
    const data40 = buildChartData({ ...BASE, mortgageTerm: 25, years: 10 });
    // year 35 vs year 28 — once mortgage term ends, cost trajectory changes
    expect(data40[35].buying).toBeLessThan(data40[27].buying);
  });

  it("deposit returned at user's chosen year lowers renting cost at that year", () => {
    // The rentalDeposit causes a one-off reduction at yr === userYears
    const withDeposit = buildChartData({ ...BASE, years: 10 });
    const noDeposit = buildChartData({ ...BASE, years: 10, rentalDeposit: 0 });
    // At year 10, renting should be lower (more profitable) with deposit returned
    expect(withDeposit[9].renting).toBeLessThan(noDeposit[9].renting);
  });
});

// ── eur ────────────────────────────────────────────────────────────────────────

describe("eur", () => {
  it("formats positive values with EUR symbol and German locale", () => {
    // German locale: period as thousand separator, comma as decimal
    const result = eur(10_000);
    expect(result).toContain("€");
    expect(result).toContain("10");
  });

  it("formats negative values with leading minus before currency symbol", () => {
    const result = eur(-10_000);
    expect(result.startsWith("-")).toBe(true);
    expect(result).toContain("€");
  });

  it("formats zero as non-negative", () => {
    const result = eur(0);
    expect(result.startsWith("-")).toBe(false);
  });

  it("formats large values correctly", () => {
    const result = eur(1_000_000);
    expect(result).toContain("€");
    expect(result.startsWith("-")).toBe(false);
  });
});
