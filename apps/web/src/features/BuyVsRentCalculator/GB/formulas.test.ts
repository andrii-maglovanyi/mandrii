import { describe, it, expect } from "vitest";
import { stampDuty, calculate, buildChartData, gbp } from "./formulas";
import type { CalculatorInputs } from "./types";
import { pmt, remainingBalance } from "../utils/helpers";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Round to 2 decimal places for financial comparisons */
const r2 = (n: number) => Math.round(n * 100) / 100;

// Default inputs matching the original spreadsheet for cross-checking
const BASE: CalculatorInputs = {
  propertyValue: 500_000,
  deposit: 50_000,
  mortgageRate: 4.5,
  mortgageTerm: 30,
  firstTimeBuyer: true,
  propertyAppreciation: 2.5,
  initialBuyingCosts: 5_000,
  initialRepairCosts: 5_000,
  saleFeesPct: 1,
  maintenancePct: 1,
  annualHomeInsurance: 500,
  mortgageArrangementFee: 1_000,
  remortgagingFrequencyYears: 5,
  averageRemortgagingCost: 500,
  serviceCharge: 0,
  groundRent: 0,
  returnOnSavings: 2.5,
  monthlyRent: 2_200,
  rentIncrease: 3,
  tenancyDeposit: 0,
  years: 7,
};

// ── pmt ───────────────────────────────────────────────────────────────────────

describe("pmt", () => {
  it("matches spreadsheet monthly payment for default inputs", () => {
    // £450,000 loan at 4.5% over 30 years → ~£2,280.08/mo
    expect(r2(pmt(4.5, 30, 450_000))).toBe(2280.08);
  });

  it("returns 0 when principal is 0", () => {
    expect(pmt(4.5, 30, 0)).toBe(0);
  });

  it("returns 0 when principal is negative (deposit > property value)", () => {
    expect(pmt(4.5, 30, -100_000)).toBe(0);
  });

  it("returns 0 when term is 0", () => {
    expect(pmt(4.5, 0, 450_000)).toBe(0);
  });

  it("handles zero interest rate (interest-free mortgage)", () => {
    // £120,000 over 10 years at 0% → £1,000/mo exactly
    expect(r2(pmt(0, 10, 120_000))).toBe(1000);
  });

  it("produces higher payment with shorter term", () => {
    expect(pmt(4.5, 15, 450_000)).toBeGreaterThan(pmt(4.5, 30, 450_000));
  });

  it("produces higher payment with higher rate", () => {
    expect(pmt(5.0, 30, 450_000)).toBeGreaterThan(pmt(4.5, 30, 450_000));
  });
});

// ── remainingBalance ──────────────────────────────────────────────────────────

describe("remainingBalance", () => {
  it("returns full principal after 0 payments", () => {
    expect(r2(remainingBalance(4.5, 30, 450_000, 0))).toBe(450_000);
  });

  it("returns 0 after all payments made (full term)", () => {
    expect(r2(remainingBalance(4.5, 30, 450_000, 30 * 12))).toBe(0);
  });

  it("matches spreadsheet balance after 6 years (72 payments)", () => {
    // Parameters sheet: mortgage balance at YearCalc=6 → £401,123
    expect(Math.round(remainingBalance(4.5, 30, 450_000, 72))).toBe(401_123);
  });

  it("returns 0 for zero principal", () => {
    expect(remainingBalance(4.5, 30, 0, 36)).toBe(0);
  });

  it("decreases monotonically with more payments", () => {
    const b1 = remainingBalance(4.5, 30, 450_000, 12);
    const b2 = remainingBalance(4.5, 30, 450_000, 24);
    expect(b2).toBeLessThan(b1);
  });
});

// ── stampDuty ─────────────────────────────────────────────────────────────────

describe("stampDuty", () => {
  describe("first-time buyer relief", () => {
    it("£0 on properties up to £300,000", () => {
      expect(stampDuty(300_000, true)).toBe(0);
      expect(stampDuty(250_000, true)).toBe(0);
      expect(stampDuty(0, true)).toBe(0);
    });

    it("5% on portion above £300k up to £500k", () => {
      // £500k: (500k - 300k) * 5% = £10,000
      expect(stampDuty(500_000, true)).toBe(10_000);
      // £400k: (400k - 300k) * 5% = £5,000
      expect(stampDuty(400_000, true)).toBe(5_000);
    });

    it("switches to standard rates above £500k", () => {
      // £500,001 → standard: 0+2500+12500+0.05*1 = £15,000.05
      expect(r2(stampDuty(500_001, true))).toBe(15_000.05);
    });
  });

  describe("standard rates", () => {
    it("£0 on properties up to £125,000", () => {
      expect(stampDuty(125_000, false)).toBe(0);
    });

    it("2% on portion £125k-£250k", () => {
      // £250k: 0 + (125k * 2%) = £2,500
      expect(stampDuty(250_000, false)).toBe(2_500);
    });

    it("5% on portion £250k-£925k", () => {
      // £295k: 0 + 2500 + (45k * 5%) = £4,750 (GOV.UK example)
      expect(stampDuty(295_000, false)).toBe(4_750);
      // £500k: 0 + 2500 + (250k * 5%) = £15,000
      expect(stampDuty(500_000, false)).toBe(15_000);
    });

    it("10% on portion £925k-£1.5m", () => {
      // £1m: 0 + 2500 + 33750 + (75k * 10%) = £43,750
      expect(stampDuty(1_000_000, false)).toBe(43_750);
    });

    it("12% above £1.5m", () => {
      // £1.5m exactly: 0 + 2500 + 33750 + 57500 = £93,750
      expect(stampDuty(1_500_000, false)).toBe(93_750);
      // £2m: 93750 + (500k * 12%) = £153,750
      expect(stampDuty(2_000_000, false)).toBe(153_750);
    });

    it("FTB and non-FTB both pay £0 below £125k", () => {
      // fix: was comparing stampDuty(200_000, true) to itself
      expect(stampDuty(100_000, true)).toBe(stampDuty(100_000, false));
    });
  });
});

// ── calculate - buying figures ────────────────────────────────────────────────

describe("calculate - buying", () => {
  const result = calculate(BASE);

  it("stamp duty matches spreadsheet (FTB £500k → £10,000)", () => {
    expect(result.stampDuty).toBe(10_000);
  });

  it("monthly mortgage matches spreadsheet (~£2,280.08)", () => {
    expect(r2(result.monthlyMortgage)).toBe(2280.08);
  });

  it("total mortgage payments over 7 years matches spreadsheet (£191,527.05)", () => {
    expect(r2(result.totalMortgagePayments)).toBe(191_527.05);
  });

  it("equity value matches spreadsheet (£178,723.52)", () => {
    expect(r2(result.equity)).toBe(178_723.52);
  });

  it("selling fees matches spreadsheet (£5,798.47)", () => {
    expect(r2(result.sellingFees)).toBe(5_798.47);
  });

  it("repairs & maintenance matches spreadsheet (£42,737.15)", () => {
    expect(r2(result.maintenance)).toBe(42_737.15);
  });

  it("home insurance total is annualHomeInsurance × years (£3,500)", () => {
    expect(result.totalInsurance).toBe(3_500);
  });

  it("buying net matches spreadsheet (-£131,339.15)", () => {
    expect(r2(result.buyingNet)).toBe(-131_339.15);
  });

  it("caps mortgage payments at mortgage term (not years)", () => {
    const longStay = calculate({ ...BASE, years: 35, mortgageTerm: 30 });
    const monthly = pmt(BASE.mortgageRate, BASE.mortgageTerm, BASE.propertyValue - BASE.deposit);
    expect(r2(longStay.totalMortgagePayments)).toBe(r2(monthly * 12 * 30));
  });
});

// ── calculate - renting figures ───────────────────────────────────────────────

describe("calculate - renting", () => {
  const result = calculate(BASE);

  it("savings from not buying matches spreadsheet (£70,500)", () => {
    expect(result.initialSavings).toBe(70_500);
  });

  it("return on initial savings matches spreadsheet (£13,208)", () => {
    expect(Math.round(result.returnOnInitialSavings)).toBe(13_208);
  });

  it("return on ongoing savings matches spreadsheet (£208.32)", () => {
    expect(r2(result.ongoingSavings)).toBe(208.32);
  });

  it("rent paid matches spreadsheet (£202,289)", () => {
    expect(Math.round(result.rentPaid)).toBe(202_289);
  });

  it("renting net matches spreadsheet (-£188,872.68)", () => {
    expect(r2(result.rentingNet)).toBe(-188_872.68);
  });
});

// ── calculate - summary ───────────────────────────────────────────────────────

describe("calculate - summary", () => {
  it("buying is better after 7 years by ~£57,534", () => {
    const { buyingNet, rentingNet } = calculate(BASE);
    expect(buyingNet).toBeGreaterThan(rentingNet);
    expect(Math.round(Math.abs(rentingNet - buyingNet))).toBe(57_534);
  });

  it("renting wins when rent is very low relative to mortgage", () => {
    const { buyingNet, rentingNet } = calculate({ ...BASE, monthlyRent: 500 });
    expect(rentingNet).toBeGreaterThan(buyingNet);
  });

  it("buying wins faster when property appreciates strongly", () => {
    const low = calculate({ ...BASE, propertyAppreciation: 1 });
    const high = calculate({ ...BASE, propertyAppreciation: 8 });
    expect(high.buyingNet).toBeGreaterThan(low.buyingNet);
  });

  it("higher mortgage rate worsens buying net", () => {
    const low = calculate({ ...BASE, mortgageRate: 2 });
    const high = calculate({ ...BASE, mortgageRate: 7 });
    expect(high.buyingNet).toBeLessThan(low.buyingNet);
  });

  it("handles deposit equal to property value (no mortgage)", () => {
    const result = calculate({ ...BASE, deposit: 500_000 });
    expect(result.monthlyMortgage).toBe(0);
    expect(result.totalMortgagePayments).toBe(0);
  });

  it("handles deposit greater than property value gracefully", () => {
    const result = calculate({ ...BASE, deposit: 600_000 });
    expect(result.monthlyMortgage).toBe(0);
    expect(Number.isFinite(result.buyingNet)).toBe(true);
  });

  it("handles years = 1", () => {
    const result = calculate({ ...BASE, years: 1 });
    expect(Number.isFinite(result.buyingNet)).toBe(true);
    expect(Number.isFinite(result.rentingNet)).toBe(true);
  });
});

// ── buildChartData ────────────────────────────────────────────────────────────

describe("buildChartData", () => {
  const data = buildChartData(BASE);

  it("always returns 40 data points", () => {
    expect(data).toHaveLength(40);
  });

  it("year values are sequential from 1 to 40", () => {
    expect(data[0].year).toBe(1);
    expect(data[39].year).toBe(40);
    data.forEach((d, i) => expect(d.year).toBe(i + 1));
  });

  it("buying at year 7 matches spreadsheet col I (£131,339)", () => {
    expect(data[6].buying).toBe(131_339);
  });

  it("renting at year 7 matches spreadsheet col N (£188,873)", () => {
    expect(data[6].renting).toBe(188_873);
  });

  it("buying values are all finite numbers", () => {
    data.forEach((d) => expect(Number.isFinite(d.buying)).toBe(true));
  });

  it("renting values are all finite numbers", () => {
    data.forEach((d) => expect(Number.isFinite(d.renting)).toBe(true));
  });

  it("renting cost grows over time (rent increases each year)", () => {
    expect(data[19].renting).toBeGreaterThan(data[9].renting);
  });

  it("buying cost falls after mortgage is paid off (year 30+)", () => {
    expect(data[35].buying).toBeLessThan(data[29].buying);
  });
});

// ── gbp ───────────────────────────────────────────────────────────────────────

describe("gbp", () => {
  it("formats positive values correctly", () => {
    expect(gbp(10_000)).toBe("£10,000.00");
  });

  it("formats negative values with leading minus", () => {
    expect(gbp(-10_000)).toBe("-£10,000.00");
  });

  it("formats zero as positive", () => {
    expect(gbp(0)).toBe("£0.00");
  });

  it("formats fractional pence correctly", () => {
    expect(gbp(1234.56)).toBe("£1,234.56");
  });

  it("formats large values with correct thousand separators", () => {
    expect(gbp(1_000_000)).toBe("£1,000,000.00");
  });
});
