import type { CalculatorInputs } from "./types";

/**
 * Default inputs for the Polish calculator.
 *
 * NOTE: These defaults represent an illustrative scenario for a major Polish city
 * (Warsaw / Kraków style). They are NOT national Polish averages.
 *
 * Property value: 600,000 PLN — a mid-range 55 m² flat in a major Polish city
 * (Warsaw city centre avg ~14,000–15,000 PLN/m²; outside centre ~10,000 PLN/m²;
 * other major cities 8,000–12,000 PLN/m²).
 *
 * Deposit: 120,000 PLN (20% — standard minimum for best mortgage rates).
 * Most banks require 10–20% Wkład własny; <20% typically triggers required mortgage insurance.
 *
 * Mortgage rate: 7.0% — indicative variable rate in 2026.
 * Polish variable mortgages are linked to WIBOR 3M or 6M + bank margin (~2–2.5%).
 * After NBP rate cuts, rates have eased; verify current WIBOR and bank margins.
 * Fixed-rate 5yr products available at approximately 6.5–7.5%.
 *
 * Rent: 2,820 PLN/month — illustrative for a 1-bed city-centre flat in a major city.
 * Actual rents vary significantly by city and neighbourhood.
 *
 * PCC: 2% on secondary market. First-time buyers exempt since August 2023.
 * Notary: ~4,500 PLN all-in (taksa notarialna + wpis do KW + PCC on notarial act).
 * Agent fee: 2% of purchase price (negotiable; seller often also pays separately).
 * Selling fee: 2.5% (agent 2% + notary and misc ~0.5%).
 * Maintenance: 0.6% p.a. — lower because wspólnota covers building insurance.
 * Building admin fee (czynsz administracyjny / wspólnota): 600 PLN/month = 7,200 PLN/yr
 *   includes fundusz remontowy, building insurance, common areas.
 * Property tax: 72 PLN/yr — area-based municipal tax (max ~1.19 PLN/m² × 55 m²;
 *   actual rates vary by gmina — this is an illustrative low-end figure).
 *
 * Return on savings: 4.5% — indicative Konto Oszczędnościowe / broadly diversified ETF;
 * rates are easing as NBP rates fall. Verify current market rates.
 *
 * Property appreciation: 4.0% — an editorial assumption based on recent trend data;
 * this is a forward-looking estimate, not a guaranteed rate.
 *
 * Rental deposit: 2 months' cold rent (kaucja) = ~5,640 PLN (market norm is 2–3 months;
 * legal maximum is 6 months under Art. 6 ustawy o ochronie praw lokatorów).
 */
export const DEFAULT_INPUTS_PL: CalculatorInputs = {
  propertyValue: 600_000,
  deposit: 120_000, // 20% wkład własny
  mortgageRate: 7.0, // indicative variable rate (WIBOR + margin ~2–2.5%); verify current rates
  mortgageTerm: 30,
  isFirstTimeBuyer: false, // PCC-exempt if true (Art. 9 pkt 17 u.p.c.c., since Aug 2023)
  isPrimaryMarket: false, // primary market (rynek pierwotny) = VAT instead of PCC
  isFixedRate: false, // most Polish mortgages are variable (WIBOR-linked)
  fixedRatePeriodYears: 5, // standard fixed-rate period in Poland
  refinancingCost: 500, // bank fee for new rate negotiation / refinancing
  propertyAppreciation: 4.0, // editorial assumption based on recent trend data; not a forecast
  notaryCosts: 4_500, // taksa notarialna + wpis do KW + PCC on notarial act (~0.75% of purchase price)
  agentFeePct: 2.0, // buyer's agent commission (negotiable; typically 1.5–3%)
  saleFeesPct: 2.5, // selling: agent ~2% + misc notary/legal ~0.5%
  maintenancePct: 0.6, // % of property value p.a. (excludes wspólnota fees which are separate)
  annualBuildingAdminFee: 7_200, // czynsz administracyjny ~600 PLN/month (wspólnota mieszkaniowa)
  annualPropertyTax: 72, // podatek od nieruchomości ~1.19 PLN/m² × 60 m² ≈ 71 PLN/yr
  initialRepairCosts: 30_000, // wykończenie/remont — common in Polish market (stan deweloperski)
  annualHomeInsurance: 600, // ubezpieczenie mieszkania ~50 PLN/month (private content+liability)
  returnOnSavings: 4.5, // Konto Oszczędnościowe ~5% (normalising); ETF ~6–7%
  monthlyRent: 2_820, // illustrative for 1-bed city-centre flat in a major Polish city
  rentIncrease: 4.0, // Polish rental market CPI-linked; GUS: ~7% in 2024, easing to ~4%
  rentalDeposit: 5_640, // 2 months × 2,820 PLN (kaucja; market norm; legal cap = 6 months)
  years: 10,
};
