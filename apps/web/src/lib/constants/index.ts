import { UrlHelper } from "../url-helper";
import { COUNTRIES, EU_COUNTRY_CODES } from "./COUNTRIES";
import { EVENT_TYPES } from "./EVENT_TYPES";
import {
  AGE_GROUPS,
  AMENITIES,
  BEAUTY_SERVICES,
  CLOTHING_AGE_GROUPS,
  CLOTHING_GENDERS,
  CLOTHING_SIZES,
  CLOTHING_TYPES,
  CUISINE,
  CURRICULUM,
  FEATURES,
  LANGUAGES,
  PAYMENT,
  PRICE_RANGE,
  PRODUCT_CATEGORIES,
} from "./options";
import { PRICE_TYPES } from "./PRICE_TYPES";
import { EU_SHIPPING_COST, FREE_SHIPPING_THRESHOLD, ROW_SHIPPING_COST, UK_SHIPPING_COST } from "./SHIPPING_COST";
import { CATEGORIES } from "./VENUE_CATEGORIES";
import { WEEKDAYS } from "./WEEKDAYS";

export const constants = {
  audienceId: "afdc9356-46c0-42d3-8c73-83e271c96017",
  baseUrl: UrlHelper.getBaseUrl(),
  categories: CATEGORIES,
  eventTypes: EVENT_TYPES,
  fromEmail: (locale = "en") =>
    `${locale === "en" ? "Mandrii" : "Мандрій"} <hello@${UrlHelper.getProductionHostname()}>`,
  isEUCountry: (countryCode: string): boolean => {
    return EU_COUNTRY_CODES.includes(countryCode.toLowerCase());
  },
  london_coordinates: {
    lat: 51.509865,
    lng: -0.118092,
  },
  options: {
    AGE_GROUPS,
    AMENITIES,
    BEAUTY_SERVICES,
    CLOTHING_AGE_GROUPS,
    CLOTHING_GENDERS,
    CLOTHING_SIZES,
    CLOTHING_TYPES,
    CUISINE,
    CURRICULUM,
    FEATURES,
    LANGUAGES,
    PAYMENT,
    PRICE_RANGE,
    PRODUCT_CATEGORIES,
  },
  priceTypes: PRICE_TYPES,
  shippingCost: {
    eu: EU_SHIPPING_COST,
    freeThreshold: FREE_SHIPPING_THRESHOLD,
    row: ROW_SHIPPING_COST,
    uk: UK_SHIPPING_COST,
  },
  vercelBlobStorageUrl: "https://yiiprxif648vopwe.public.blob.vercel-storage.com",
  weekdays: WEEKDAYS,
  whitelisted_countries: COUNTRIES,
};
