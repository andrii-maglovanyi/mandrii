/**
 * Shared calculation helpers used by both GB and DE calculators.
 * These functions are pure calculations independent of tax/location specifics.
 */

/** Future value of a lump sum invested at annual rate for n years */
export function fvLump(pv: number, annualRate: number, years: number): number {
  return pv * Math.pow(1 + annualRate / 100, years);
}

/** Total rent paid over N years with annual increases */
export function totalRentPaid(monthlyRent: number, annualIncrease: number, years: number): number {
  let total = 0;
  let rent = monthlyRent;
  for (let y = 0; y < years; y++) {
    total += rent * 12;
    rent *= 1 + annualIncrease / 100;
  }
  return total;
}

/**
 * Repairs & maintenance = initialRepairCosts + maintenancePct% × SUM(propertyValue each year)
 *
 * Applicable to both GB and DE versions with the same formula.
 * German note: maintenance costs tend to be higher for pre-war Altbau
 * (old-stock) apartments and lower for Neubau. The 1% default is a reasonable
 * mid-point across stock types.
 */
export function totalMaintenanceCosts(
  propertyValue: number,
  annualAppreciation: number,
  maintenancePct: number,
  initialRepairCosts: number,
  years: number,
): number {
  let total = 0;
  let val = propertyValue;
  for (let y = 0; y < years; y++) {
    total += val * (maintenancePct / 100);
    val *= 1 + annualAppreciation / 100;
  }
  return total + initialRepairCosts;
}

/**
 * Cumulative return on ongoing savings.
 *
 * Models the scenario where the renter invests the annual surplus
 * (monthly mortgage − monthly rent) × 12, compounded at the savings rate.
 * Only applies when the mortgage payment exceeds rent. Returns only the
 * investment gain (accumulated balance minus total deposited).
 *
 * NOTE: This only captures surplus when mortgage > rent. If rent exceeds the
 * mortgage payment, that extra rent cost is already reflected as a higher
 * `rentPaid` figure in the renting total — the model does not additionally
 * credit the buyer for a "surplus" in that scenario, keeping both sides comparable.
 */
export function returnOnOngoingSavings(
  monthlyRent: number,
  annualRentIncrease: number,
  monthlyMortgage: number,
  annualSavingsRate: number,
  years: number,
): number {
  const annualRate = annualSavingsRate / 100;
  let balance = 0;
  let totalDeposited = 0;
  let rent = monthlyRent;
  for (let y = 0; y < years; y++) {
    const annualSurplus = Math.max(0, (monthlyMortgage - rent) * 12);
    balance = (balance + annualSurplus) * (1 + annualRate);
    totalDeposited += annualSurplus;
    rent *= 1 + annualRentIncrease / 100;
  }
  return balance - totalDeposited;
}

/**
 * Safe number coercion utility — converts values to numbers with fallback.
 * Used in both GB and DE calculator functions.
 */
export function safe(n: number, fallback = 0): number {
  return Number.isFinite(n) ? n : fallback;
}
