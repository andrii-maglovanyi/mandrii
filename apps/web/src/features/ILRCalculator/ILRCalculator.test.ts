import { describe, expect, it } from "vitest";

import { ilrInitialValues } from "~/lib/validation/ilr";

import { computeILROutcome, type ILRValues } from "./ILRCalculator";

const t = (key: string) => key;

const baseValues: ILRValues = {
  ...ilrInitialValues,
  currentIncome: "13000",
  englishLevel: "B2",
  incomeYears: 3,
  passedLifeInUK: true,
  visaStartDate: "2020-01-01",
};

describe("computeILROutcome", () => {
  it("returns null when no visa start or arrival date is provided", () => {
    expect(computeILROutcome({ ...ilrInitialValues }, t)).toBeNull();
  });

  it("applies BNO reduction to a 5-year timeline when requirements are met", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        visaCategory: "bno",
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(5);
    expect(outcome?.adjustments.some((a) => a.reason.includes("British National"))).toBe(true);
    expect(outcome?.ilrDate?.getFullYear()).toBe(2025);
    expect(outcome?.earliestApplicationDate?.getFullYear()).toBe(2024);
    expect(outcome?.allRequirementsMet).toBe(true);
  });

  it("flags Ukraine schemes as ineligible even when requirements are met", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        visaCategory: "ukraine",
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.hasUkraineBlock).toBe(true);
    expect(outcome?.blockingRequirements).toHaveLength(0);
    expect(outcome?.allRequirementsMet).toBe(true);
  });

  it("flags Student visas as ineligible even when requirements are met", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        visaCategory: "student",
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.hasStudentBlock).toBe(true);
    expect(outcome?.blockingRequirements).toHaveLength(0);
    expect(outcome?.allRequirementsMet).toBe(true);
  });

  it("blocks eligibility when criminal record or other blocking issues exist", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        hasCriminalRecord: true,
        hasDebts: true,
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.hasCriminalBlock).toBe(true);
    expect(outcome?.blockingRequirements.length).toBeGreaterThan(0);
    expect(outcome?.allRequirementsMet).toBe(false);
  });

  it("keeps dependant timeline at least as long as main applicant when dependant would otherwise be faster", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        hasPartner: true,
        isBritishPartner: false,
        occupationLevel: "RQF6+",
        partnerWorkStatus: "working-high",
        visaCategory: "skilled-worker",
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(10);
    expect(outcome?.partnerYears).toBe(10); // capped to main applicant timeline
    expect(
      outcome?.partnerAdjustments.some((a) => a.type === "info" && a.reason.includes("cannot be shorter")),
    ).toBe(true);
  });

  it("adds illegal entry penalties on top of the baseline", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        entryMethod: "illegal",
        illegalPenaltyYears: 20,
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(30);
    expect(outcome?.adjustments.find((a) => a.type === "penalty")?.years).toBe(20);
  });

  it("blocks timelines when income threshold or duration is not met", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        currentIncome: "5000",
        incomeYears: 1,
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.blockingRequirements.length).toBeGreaterThan(0);
    expect(outcome?.allRequirementsMet).toBe(false);
  });

  it("applies volunteering reductions and warns they are consultative", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        hasVolunteering: true,
        volunteeringReductionYears: 5,
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(5);
    expect(outcome?.warnings.some((w) => w.includes("Volunteering reduction"))).toBe(true);
    expect(outcome?.adjustments.find((a) => a.reason.includes("Community volunteering"))?.years).toBe(5);
  });

  it("uses the strongest reduction among English C1, volunteering, and public service", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        englishLevel: "C1",
        hasVolunteering: true,
        isPublicService: true,
        occupationLevel: "RQF6+",
        publicServiceYears: 6,
        volunteeringReductionYears: 4,
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(5); // public service 5-year reduction wins over volunteering 4 and English 1
    expect(outcome?.adjustments.find((a) => a.reason.includes("Public service"))?.years).toBe(5);
    expect(outcome?.warnings.some((w) => w.includes("Volunteering reduction"))).toBe(true);
  });

  it("applies only the single largest reduction across all reduction options", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        currentIncome: "130000", // 7-year reduction
        hasVolunteering: true, // 5-year reduction
        incomeYears: 3,
        visaCategory: "bno", // 5-year reduction
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(3); // 10 - 7 = 3 floor
    const reductions = outcome?.adjustments.filter((a) => a.type === "reduction") ?? [];
    expect(reductions).toHaveLength(1);
    expect(reductions[0]?.years).toBe(7);
  });

  it("applies income band reductions to 10/5/3-year routes", () => {
    const skilledWorkerValues: ILRValues = {
      ...baseValues,
      occupationLevel: "RQF6+",
      visaCategory: "skilled-worker",
    };

    const lowIncome = computeILROutcome(
      {
        ...skilledWorkerValues,
        currentIncome: "40000",
      },
      t,
    );
    const midIncome = computeILROutcome(
      {
        ...skilledWorkerValues,
        currentIncome: "60000",
      },
      t,
    );
    const highIncome = computeILROutcome(
      {
        ...skilledWorkerValues,
        currentIncome: "130000",
      },
      t,
    );

    expect(lowIncome?.mainApplicantYears).toBe(10);
    expect(midIncome?.mainApplicantYears).toBe(5);
    expect(highIncome?.mainApplicantYears).toBe(3);
  });

  it("uses the slower dependant route for children when it exceeds the main applicant timeline", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        currentIncome: "130000", // main applicant drops to 3 years
        hasChildren: true,
        hasPartner: true,
        isBritishPartner: false,
        occupationLevel: "RQF6+",
        partnerWorkStatus: "working-high", // partner at 5 years
        visaCategory: "skilled-worker",
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(3);
    expect(outcome?.partnerYears).toBe(5);
    expect(outcome?.childrenYears).toBe(5);
  });

  it("applies only the single largest penalty when multiple penalties exist", () => {
    const outcome = computeILROutcome(
      {
        ...baseValues,
        entryMethod: "illegal",
        hasOverstayed: true,
        illegalPenaltyYears: 15,
        overstayMonths: 12,
        overstayPenaltyYears: 10,
        visaCategory: "skilled-worker",
      },
      t,
    );

    expect(outcome).not.toBeNull();
    expect(outcome?.mainApplicantYears).toBe(25); // 10 + 15
    const penalties = outcome?.adjustments.filter((a) => a.type === "penalty") ?? [];
    expect(penalties).toHaveLength(1);
    expect(penalties[0]?.years).toBe(15);
  });
});
