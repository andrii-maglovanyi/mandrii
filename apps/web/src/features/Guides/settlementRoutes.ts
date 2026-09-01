import { CountryCode } from "~/lib/constants/COUNTRIES";

export type SettlementStageId =
  | "status-and-documents"
  | "home-and-address"
  | "healthcare"
  | "work-and-money"
  | "everyday-life"
  | "children-and-school"
  | "driving-and-car"
  | "study-and-qualifications";

export type SettlementGuideAvailability = "coming-soon" | "published";

export type SettlementGuide = {
  availability: SettlementGuideAvailability;
  /** Optional country-specific summary once a guide has been researched. */
  descriptionKey?: string;
  /** Internal Mandrii guide URL. Required before a guide can be presented as available. */
  href?: string;
  id: SettlementStageId;
  titleKey: string;
};

export type SettlementRoute = {
  coreStages: readonly SettlementGuide[];
  countryCode: CountryCode;
  optionalStages: readonly SettlementGuide[];
};

/**
 * Settlement routes deliberately hold structure and availability separately from
 * guide content. A stage only becomes actionable when Mandrii has a real,
 * reviewed guide for it.
 *
 * TODO(settlement-route): Follow docs/settlement-route-roadmap.md before
 * changing a stage to published.
 */
export const settlementRoutes: Partial<Record<CountryCode, SettlementRoute>> = {
  gb: {
    countryCode: "gb",
    coreStages: [
      {
        availability: "coming-soon",
        id: "status-and-documents",
        titleKey: "Status and documents",
      },
      {
        availability: "coming-soon",
        id: "home-and-address",
        titleKey: "Home and address",
      },
      {
        availability: "coming-soon",
        id: "healthcare",
        titleKey: "Healthcare",
      },
      {
        availability: "coming-soon",
        id: "work-and-money",
        titleKey: "Work and money",
      },
      {
        availability: "coming-soon",
        id: "everyday-life",
        titleKey: "Everyday life",
      },
    ],
    optionalStages: [
      {
        availability: "coming-soon",
        id: "children-and-school",
        titleKey: "Children and school",
      },
      {
        availability: "coming-soon",
        id: "driving-and-car",
        titleKey: "Driving and car",
      },
      {
        availability: "coming-soon",
        id: "study-and-qualifications",
        titleKey: "Study and qualifications",
      },
    ],
  },
};

export const getSettlementRoute = (countryCode: "" | CountryCode) =>
  countryCode ? (settlementRoutes[countryCode] ?? null) : null;
