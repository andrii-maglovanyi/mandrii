import { UrlHelper } from "../url-helper";
import { COUNTRIES } from "./COUNTRIES";
import { EVENT_TYPES } from "./EVENT_TYPES";
import {
  AGE_GROUPS,
  AMENITIES,
  BEAUTY_SERVICES,
  CUISINE,
  CURRICULUM,
  FEATURES,
  LANGUAGES,
  PAYMENT,
  PRICE_RANGE,
  PRODUCT_CATEGORIES,
} from "./options";
import { CATEGORIES } from "./VENUE_CATEGORIES";
import { WEEKDAYS } from "./WEEKDAYS";

export const constants = {
  audienceId: "afdc9356-46c0-42d3-8c73-83e271c96017",
  baseUrl: UrlHelper.getBaseUrl(),
  categories: CATEGORIES,
  eventTypes: EVENT_TYPES,
  fromEmail: (locale = "en") =>
    `${locale === "en" ? "Mandrii" : "Мандрій"} <hello@${UrlHelper.getProductionHostname()}>`,
  london_coordinates: {
    lat: 51.509865,
    lng: -0.118092,
  },
  options: {
    AGE_GROUPS,
    AMENITIES,
    BEAUTY_SERVICES,
    CUISINE,
    CURRICULUM,
    FEATURES,
    LANGUAGES,
    PAYMENT,
    PRICE_RANGE,
    PRODUCT_CATEGORIES,
  },
  vercelBlobStorageUrl: "https://yiiprxif648vopwe.public.blob.vercel-storage.com",
  weekdays: WEEKDAYS,
  whitelisted_countries: COUNTRIES,
};
