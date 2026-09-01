export const COUNTRIES = {
  de: {
    label: {
      en: "Germany",
      uk: "Німеччина",
    },
  },
  es: {
    label: {
      en: "Spain",
      uk: "Іспанія",
    },
  },
  gb: {
    label: {
      en: "United Kingdom",
      uk: "Велика Британія",
    },
  },
  ge: {
    label: {
      en: "Georgia",
      uk: "Грузія",
    },
  },
  nl: {
    label: {
      en: "Netherlands",
      uk: "Нідерланди",
    },
  },
  pl: {
    label: {
      en: "Poland",
      uk: "Польща",
    },
  },
};

export type CountryCode = keyof typeof COUNTRIES;

export const isCountryCode = (value: string): value is CountryCode => value in COUNTRIES;

export const EU_COUNTRY_CODES = [
  "at",
  "be",
  "bg",
  "hr",
  "cy",
  "cz",
  "dk",
  "ee",
  "fi",
  "fr",
  "de",
  "gr",
  "hu",
  "ie",
  "it",
  "lv",
  "lt",
  "lu",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "sk",
  "si",
  "es",
  "se",
];
