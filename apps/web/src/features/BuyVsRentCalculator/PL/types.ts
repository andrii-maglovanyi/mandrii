import { ChartDataPoint, RentingMetrics, SummaryMetrics } from "../common";

/**
 * User input parameters for the Polish calculator.
 *
 * Key Polish-specific fields:
 *
 * - pccTax: PCC (Podatek od czynności cywilnoprawnych) - 2% civil-law transactions tax
 *   applies to secondary market purchases. Primary market (deweloper / developer) is
 *   VAT-exempt from PCC. First-time buyers are exempt from PCC as of 2023.
 *
 * - isFirstTimeBuyer: PCC exemption under Art. 9 pkt 17 u.p.c.c. (added by Dz.U. 2023
 *   poz. 1205) - persons who have NEVER owned any residential property are exempt from
 *   the 2% PCC on the first purchase. Does NOT apply to primary market (where VAT
 *   rather than PCC is charged).
 *
 * - isPrimaryMarket: Primary market (rynek pierwotny) means buying directly from a
 *   developer (deweloper). VAT at 8% for dwellings ≤150 m² (23% above). PCC does NOT
 *   apply. Secondary market (rynek wtórny) attracts 2% PCC.
 *
 * - notaryCosts: Taksa notarialna (notary fee) is regulated by Rozporządzenie Ministra
 *   Sprawiedliwości. The maximum fee is calculated on a sliding scale up to ~10,000 PLN
 *   for properties >2m PLN, plus court registration (wpis do KW) ~200 PLN and PCC on
 *   the notarial act ~23 PLN. Typically 3,000-6,000 PLN all-in for a standard flat.
 *
 * - mortgageRate: Polish mortgages are predominantly variable-rate, linked to WIBOR 3M
 *   or 6M (plus bank margin ~2%). After NBP rate cuts in 2025-2026, typical total
 *   variable mortgage rates are approximately 6.0-7.5% (indicative; verify current
 *   WIBOR and bank margins). Fixed-rate products (5yr) are available at slightly
 *   higher initial rates but provide payment certainty.
 *
 * - isFixedRate / fixedRatePeriodYears: Fixed-rate (stałe oprocentowanie) mortgages
 *   are available typically for 5 years. After the fixed period the rate reverts to
 *   variable (WIBOR + margin). The refinancing cost at each fixed-period boundary is
 *   modest (bank fee ~0-1,000 PLN).
 *
 * - annualPropertyTax: Podatek od nieruchomości - a municipal tax (gmina) assessed on
 *   floor area (per m²), NOT on value. Rates are set by each gmina within statutory
 *   maxima set annually by the Minister of Finance. For 2025 the maximum for
 *   residential buildings is 1.19 PLN/m²/year (up from 1.00 PLN/m²/year). For a
 *   60 m² flat, this amounts to ~72-714 PLN/year depending on the municipality.
 *   This is an area-based tax; the actual amount varies significantly by location.
 *
 * - rentalDeposit: Kaucja - under Art. 6 ustawy o ochronie praw lokatorów, the deposit
 *   is capped at 6 months' rent (kaucja mieszkaniowa ≤ 6-krotność czynszu). In
 *   practice 2-3 months is the market norm. The deposit is typically held directly
 *   by the landlord; there is no statutory third-party deposit protection scheme.
 *
 * - buildingAdminFee: Czynsz administracyjny (wspólnota / spółdzielnia) - monthly
 *   charges paid to the housing association (wspólnota mieszkaniowa or spółdzielnia
 *   mieszkaniowa), covering building insurance, common area maintenance, and the
 *   fundusz remontowy (renovation fund). Typically 300-800 PLN/month.
 */
export type CalculatorInputs = {
  readonly propertyValue: number;
  readonly deposit: number;
  readonly mortgageRate: number;
  readonly mortgageTerm: number;
  readonly isFirstTimeBuyer: boolean;
  readonly isPrimaryMarket: boolean;
  readonly isFixedRate: boolean;
  readonly fixedRatePeriodYears: number;
  readonly refinancingCost: number;
  readonly propertyAppreciation: number;
  readonly notaryCosts: number;
  readonly agentFeePct: number; // buyer's agent commission - 0-3% (negotiable, not legally split)
  readonly saleFeesPct: number;
  readonly maintenancePct: number;
  readonly annualBuildingAdminFee: number; // czynsz administracyjny (wspólnota/spółdzielnia)
  readonly annualPropertyTax: number; // podatek od nieruchomości (area-based, not value-based)
  readonly initialRepairCosts: number;
  readonly annualHomeInsurance: number;
  readonly returnOnSavings: number;
  readonly monthlyRent: number;
  readonly rentIncrease: number;
  readonly rentalDeposit: number;
  readonly years: number;
};

// Composition types
type BuyingMetrics = {
  readonly deposit: number;
  readonly pccTaxAmount: number; // Podatek od czynności cywilnoprawnych (2% - secondary market non-FTB)
  readonly notaryCosts: number;
  readonly agentFee: number;
  readonly totalMortgagePayments: number;
  readonly equity: number;
  readonly initialRepairCosts: number;
  readonly maintenance: number;
  readonly totalInsurance: number;
  readonly totalBuildingAdminFees: number;
  readonly totalPropertyTax: number;
  readonly totalRefinancingCosts: number;
  readonly sellingFees: number;
  readonly buyingNet: number;
  readonly monthlyMortgage: number;
  readonly loanAmount: number;
};

/** Complete calculation result combining all buying, renting and summary metrics */
export type CalculationResult = BuyingMetrics & RentingMetrics & SummaryMetrics;

// Re-export common types for convenience
export type { ChartDataPoint, RentingMetrics, SummaryMetrics };

/** Curried setter for Polish calculator inputs - set("key")(value) */
export type InputSetter = <K extends keyof CalculatorInputs>(key: K) => (value: CalculatorInputs[K]) => void;
