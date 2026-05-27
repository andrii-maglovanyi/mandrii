import { pmt, remainingBalance } from "../utils/helpers";
import {
  fvLump,
  totalRentPaid,
  totalMaintenanceCosts,
  returnOnOngoingSavings,
  safe,
  type ChartDataPoint,
} from "../common";
import type { CalculationResult, CalculatorInputs } from "./types";

// ── PCC (Civil-Law Transactions Tax) ─────────────────────────────────────────

/**
 * PCC — Podatek od czynności cywilnoprawnych (Civil-Law Transactions Tax)
 *
 * Applicable law: Ustawa z dnia 9 września 2000 r. o podatku od czynności
 * cywilnoprawnych (Dz.U. 2023 poz. 170 z późn. zm.).
 *
 * Rate: 2% of the market value of the property.
 *
 * Exemptions (Art. 9 u.p.c.c.):
 *   1. PRIMARY MARKET: When buying directly from a VAT-registered developer
 *      (rynek pierwotny), the transaction is subject to VAT (8% for dwellings ≤150 m²;
 *      23% for dwellings >150 m²) and is therefore EXEMPT from PCC under Art. 2 pkt 4.
 *
 *   2. FIRST-TIME BUYER (since 31 August 2023, Dz.U. 2023 poz. 1205):
 *      A natural person who has NEVER owned (in whole or in part) any residential
 *      property (mieszkanie, dom) anywhere is exempt from PCC on their FIRST purchase.
 *      This applies to SECONDARY MARKET only (primary market already exempt via VAT).
 *      Co-buyers: ALL buyers must qualify for the exemption to apply.
 *
 * When PCC applies: secondary market, non-first-time buyer.
 * When PCC does NOT apply: primary market (VAT applies instead); first-time buyer.
 *
 * Note: Mortgage registration costs (NOT a 2% tax — that 2% rate applies only to
 * the property purchase itself, not to the mortgage). The mortgage-related fees are:
 * - 19 PLN: PCC on the notarial act establishing the mortgage charge (Art. 7 ust. 1
 *   pkt 7 u.p.c.c.) — a nominal flat fee, not a percentage;
 * - 200 PLN: court fee for land register (KW) mortgage entry (wpis hipoteki).
 * These are typically included in the notaryCosts input rather than modelled separately.
 */
export function pccTax(propertyValue: number, isFirstTimeBuyer: boolean, isPrimaryMarket: boolean): number {
  if (isPrimaryMarket) return 0; // VAT-registered developer sale — exempt from PCC
  if (isFirstTimeBuyer) return 0; // Art. 9 pkt 17 u.p.c.c. exemption (since Aug 2023)
  return propertyValue * 0.02; // 2% flat on purchase price
}

// ── Summary calculation ───────────────────────────────────────────────────────

/**
 * Produces all figures shown in the results panel.
 *
 * Key Polish-specific differences vs. GB/DE:
 *
 * 1. PCC TAX (Podatek od czynności cywilnoprawnych): 2% flat on the purchase price
 *    for secondary market transactions. Exempt for: (a) primary market (VAT instead),
 *    (b) first-time buyers since August 2023.
 *
 * 2. VARIABLE-RATE MORTGAGES (WIBOR-linked): The dominant product in Poland.
 *    Rate = WIBOR 3M or 6M + bank margin (~2–2.5%). WIBOR 3M was ~4.5% in May 2026
 *    after NBP cut its reference rate to 3.75%. Fixed-rate mortgages (5yr Zinsbindung
 *    equivalent) are available but less common. After the fixed period, the loan
 *    automatically reverts to variable (WIBOR + margin).
 *
 * 3. NOTARY COSTS (Taksa notarialna): All property sales in Poland must be notarised.
 *    The notary fee (taksa) is regulated by the Minister of Justice and calculated on
 *    a sliding scale on the purchase price. For a 600,000 PLN property, the maximum
 *    taksa is ~4,920 PLN. Additionally: court fee for land register entry ~200 PLN,
 *    PCC on the notarial act itself (23 PLN), and mortgage hypothek registration ~200 PLN.
 *    Total typically 3,000–6,000 PLN depending on property value.
 *
 * 4. BUILDING ADMIN FEE (Czynsz administracyjny): Owners of flats in wspólnota
 *    mieszkaniowa (housing association) or spółdzielnia mieszkaniowa (housing co-op)
 *    pay a monthly charge covering: fundusz remontowy (mandatory renovation fund),
 *    building insurance, common area maintenance, lift, cleaning etc.
 *    Typically 300–800 PLN/month (3,600–9,600 PLN/year).
 *    This is analogous to German Hausgeld but different in legal structure.
 *
 * 5. PROPERTY TAX (Podatek od nieruchomości): Crucially, in Poland this tax is
 *    assessed on FLOOR AREA (m²), NOT on value. Municipal rates are set by each
 *    gmina within annual statutory maxima set by the Minister of Finance.
 *    Maximum for 2025: 1.19 PLN/m²/year (residential buildings/parts). This means
 *    the tax is tiny — ~72 PLN/year for a 60 m² flat — unlike GB council tax or
 *    DE Grundsteuer. Users input their actual annual amount directly.
 *
 * 6. STAN DEWELOPERSKI (Developer finish state): Most new-build flats in Poland are
 *    sold in "developer state" — walls plastered, pipes/cables installed, but NO
 *    flooring, tiles, kitchen, bathroom fittings, or painting. Buyers must budget
 *    for full fit-out: typically 1,000–2,500 PLN/m². This makes initial repair/
 *    renovation costs very significant (often 50,000–150,000 PLN for a 60 m² flat).
 *
 * 7. AGENT COMMISSION (Prowizja pośrednika): Unlike Germany (legally split 50/50),
 *    the buyer's agent commission in Poland is negotiable and not legally regulated.
 *    Typically the seller also pays a separate commission (1.5–3%) to their agent.
 *    Buyer's commission: 1.5–3% (sometimes 0% if agent is seller-only).
 *
 * 8. RENTAL DEPOSIT (Kaucja): Under Art. 6 ustawy o ochronie praw lokatorów
 *    (Dz.U. 2001 Nr 71 poz. 733 z późn. zm.), the landlord may demand a deposit
 *    of up to 6 months' rent (hard cap). Market norm is 2–3 months. There is NO
 *    statutory third-party deposit protection scheme in Poland (unlike UK DPS).
 *    The deposit is typically held by the landlord and returned at lease end.
 *
 * 9. REFINANCING (variable-to-variable or end of fixed period): When the fixed-rate
 *    period expires, the loan automatically reverts to variable. Refinancing to a
 *    different bank involves modest costs: bank processing fee, potential mortgage
 *    hypothek amendment (zmiana hipoteki) ~200–500 PLN. No mandatory remortgaging
 *    ceremony as in DE (no required notarial act for rate change with same bank).
 */
export function calculate(inputs: CalculatorInputs): CalculationResult {
  const propertyValue = safe(inputs.propertyValue);
  const deposit = safe(inputs.deposit);
  const mortgageRate = safe(inputs.mortgageRate);
  const mortgageTerm = safe(inputs.mortgageTerm, 1);
  const propertyAppreciation = safe(inputs.propertyAppreciation);
  const notaryCosts = safe(inputs.notaryCosts);
  const initialRepairCosts = safe(inputs.initialRepairCosts);
  const agentFeePct = safe(inputs.agentFeePct);
  const saleFeesPct = safe(inputs.saleFeesPct);
  const maintenancePct = safe(inputs.maintenancePct);
  const annualHomeInsurance = safe(inputs.annualHomeInsurance);
  const annualBuildingAdminFee = safe(inputs.annualBuildingAdminFee);
  const annualPropertyTax = safe(inputs.annualPropertyTax);
  const returnOnSavings = safe(inputs.returnOnSavings);
  const monthlyRent = safe(inputs.monthlyRent);
  const rentIncrease = safe(inputs.rentIncrease);
  const rentalDeposit = safe(inputs.rentalDeposit);
  const years = Math.max(1, safe(inputs.years, 1));

  const { isFirstTimeBuyer, isPrimaryMarket, isFixedRate } = inputs;
  const fixedRatePeriodYears = Math.max(1, safe(inputs.fixedRatePeriodYears, 5));
  const refinancingCost = safe(inputs.refinancingCost);

  const loanAmount = Math.max(0, propertyValue - deposit);
  const monthlyMortgage = pmt(mortgageRate, mortgageTerm, loanAmount);
  const mortgagePayingYears = Math.min(years, mortgageTerm);
  const totalMortgagePayments = monthlyMortgage * 12 * mortgagePayingYears;

  // PCC — only on secondary market, non-first-time buyer
  const pccTaxAmount = pccTax(propertyValue, isFirstTimeBuyer, isPrimaryMarket);
  const agentFee = propertyValue * (agentFeePct / 100);

  // Refinancing events: variable-rate has no fixed periods, so no refinancing events.
  // Fixed-rate: each time the fixed period ends within the holding period triggers a cost.
  // Use (years − 1) convention — selling at exactly a fixed-rate boundary is excluded.
  const refinancingEvents = isFixedRate ? Math.floor((years - 1) / fixedRatePeriodYears) : 0;
  const totalRefinancingCosts = refinancingEvents * refinancingCost;

  // Annual fixed ownership costs
  const totalBuildingAdminFees = annualBuildingAdminFee * years;
  const totalPropertyTax = annualPropertyTax * years;

  // Equity at end of holding period (full years of appreciation)
  const equityYears = years;
  const futurePropertyValue = propertyValue * Math.pow(1 + propertyAppreciation / 100, equityYears);
  const balanceRemaining = remainingBalance(mortgageRate, mortgageTerm, loanAmount, equityYears * 12);
  const equity = futurePropertyValue - balanceRemaining;
  const sellingFees = futurePropertyValue * (saleFeesPct / 100);

  const maintenance = totalMaintenanceCosts(
    propertyValue,
    propertyAppreciation,
    maintenancePct,
    initialRepairCosts,
    years,
  );
  const totalInsurance = annualHomeInsurance * years;

  const buyingNet =
    -deposit -
    pccTaxAmount -
    agentFee -
    notaryCosts -
    totalMortgagePayments +
    equity -
    maintenance -
    totalInsurance -
    sellingFees -
    totalRefinancingCosts -
    totalBuildingAdminFees -
    totalPropertyTax;

  // ── Renting ─────────────────────────────────────────────────────────────────

  const initialSavings = deposit + pccTaxAmount + agentFee + notaryCosts + initialRepairCosts + annualHomeInsurance;

  // Investment base: excludes rentalDeposit (kaucja — held by landlord, not investable)
  const initialSavingsBase = deposit + pccTaxAmount + agentFee + notaryCosts + initialRepairCosts - rentalDeposit;

  const returnOnInitialSavings = fvLump(initialSavingsBase, returnOnSavings, years) - initialSavingsBase;
  const ongoingSavings = returnOnOngoingSavings(monthlyRent, rentIncrease, monthlyMortgage, returnOnSavings, years);
  const rentPaid = totalRentPaid(monthlyRent, rentIncrease, years);

  // Kaucja is returned at end of tenancy
  const rentingNet = returnOnInitialSavings + ongoingSavings - rentPaid + rentalDeposit;

  return {
    // Buying
    deposit,
    pccTaxAmount,
    notaryCosts,
    agentFee,
    totalMortgagePayments,
    equity,
    initialRepairCosts,
    maintenance,
    totalInsurance,
    totalBuildingAdminFees,
    totalPropertyTax,
    totalRefinancingCosts,
    sellingFees,
    buyingNet,
    monthlyMortgage,
    loanAmount,
    // Renting
    initialSavings,
    returnOnInitialSavings,
    ongoingSavings,
    rentPaid,
    rentingNet,
    // Summary
    years,
  };
}

// ── Chart data ────────────────────────────────────────────────────────────────

/**
 * Builds per-year series for the cost comparison chart.
 * Always computes at least 40 years (or userYears if longer).
 */
export function buildChartData(inputs: CalculatorInputs): readonly ChartDataPoint[] {
  const propertyValue = safe(inputs.propertyValue);
  const deposit = safe(inputs.deposit);
  const mortgageRate = safe(inputs.mortgageRate);
  const mortgageTerm = safe(inputs.mortgageTerm, 1);
  const propertyAppreciation = safe(inputs.propertyAppreciation);
  const notaryCosts = safe(inputs.notaryCosts);
  const initialRepairCosts = safe(inputs.initialRepairCosts);
  const agentFeePct = safe(inputs.agentFeePct);
  const saleFeesPct = safe(inputs.saleFeesPct);
  const maintenancePct = safe(inputs.maintenancePct);
  const annualHomeInsurance = safe(inputs.annualHomeInsurance);
  const annualBuildingAdminFee = safe(inputs.annualBuildingAdminFee);
  const annualPropertyTax = safe(inputs.annualPropertyTax);
  const returnOnSavings = safe(inputs.returnOnSavings);
  const monthlyRent = safe(inputs.monthlyRent);
  const rentIncrease = safe(inputs.rentIncrease);
  const rentalDeposit = safe(inputs.rentalDeposit);
  const userYears = Math.max(1, safe(inputs.years, 1));
  const { isFirstTimeBuyer, isPrimaryMarket, isFixedRate } = inputs;
  const fixedRatePeriodYears = Math.max(1, safe(inputs.fixedRatePeriodYears, 5));
  const refinancingCost = safe(inputs.refinancingCost);

  const loanAmount = Math.max(0, propertyValue - deposit);
  const monthlyMortgagePayment = pmt(mortgageRate, mortgageTerm, loanAmount);
  const annualMortgage = monthlyMortgagePayment * 12;
  const pccTaxAmount = pccTax(propertyValue, isFirstTimeBuyer, isPrimaryMarket);
  const agentFee = propertyValue * (agentFeePct / 100);

  const upfront = deposit + pccTaxAmount + agentFee + notaryCosts + initialRepairCosts;

  const MAX_YEARS = Math.max(40, userYears);
  const data: ChartDataPoint[] = [];

  // Renting state
  let cumRent = 0;
  let cumInvestmentProfit = 0;
  let ongoingBalance = 0;
  let ongoingDeposited = 0;
  let rent = monthlyRent;
  // Investment base: excludes kaucja (rentalDeposit)
  let investmentBase = deposit + pccTaxAmount + agentFee + notaryCosts + initialRepairCosts - rentalDeposit;

  // Buying state
  let cumMortgage = 0;
  let cumMaint = 0;
  let cumRefinancing = 0;
  let propVal = propertyValue;

  for (let yr = 1; yr <= MAX_YEARS; yr++) {
    // ── Buying ──────────────────────────────────────────────────────────────
    const pvN = propertyValue * Math.pow(1 + propertyAppreciation / 100, yr);
    const balN = remainingBalance(mortgageRate, mortgageTerm, loanAmount, yr * 12);
    const equityN = pvN - balN;
    const sellingFeesN = pvN * (saleFeesPct / 100);

    cumMortgage += yr - 1 < mortgageTerm ? annualMortgage : 0;
    cumMaint += propVal * (maintenancePct / 100);

    // Refinancing fires at fixed-rate boundaries (only for fixed-rate products)
    if (isFixedRate && yr > 1 && (yr - 1) % fixedRatePeriodYears === 0) {
      cumRefinancing += refinancingCost;
    }

    const cumAdminFees = annualBuildingAdminFee * yr;
    const cumPropertyTax = annualPropertyTax * yr;

    const totalBuying =
      upfront +
      cumMortgage +
      cumMaint +
      annualHomeInsurance * yr +
      sellingFeesN -
      equityN +
      cumRefinancing +
      cumAdminFees +
      cumPropertyTax;

    // ── Renting ─────────────────────────────────────────────────────────────
    cumRent += rent * 12;
    const annualProfit = investmentBase * (returnOnSavings / 100);
    cumInvestmentProfit += annualProfit;
    investmentBase += annualProfit;

    const surplus = Math.max(0, (monthlyMortgagePayment - rent) * 12);
    ongoingBalance = (ongoingBalance + surplus) * (1 + returnOnSavings / 100);
    ongoingDeposited += surplus;

    // Kaucja returned at user's chosen move-out year
    const depositReturn = yr === userYears ? rentalDeposit : 0;

    const totalRenting = cumRent - cumInvestmentProfit - (ongoingBalance - ongoingDeposited) - depositReturn;

    data.push({
      year: yr,
      buying: Math.round(totalBuying),
      renting: Math.round(totalRenting),
    });

    rent *= 1 + rentIncrease / 100;
    propVal *= 1 + propertyAppreciation / 100;
  }

  return data;
}

// ── Formatting ────────────────────────────────────────────────────────────────

/**
 * Formats a number as PLN currency using Polish locale conventions.
 * Poland uses space as thousands separator and comma as decimal separator.
 * The złoty sign (zł) is placed after the number.
 */
export function pln(value: number) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `-${formatted}` : formatted;
}
