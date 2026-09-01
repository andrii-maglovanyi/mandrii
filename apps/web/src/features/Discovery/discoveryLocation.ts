import { constants } from "~/lib/constants";
import { CountryCode, isCountryCode } from "~/lib/constants/COUNTRIES";
import { localStore } from "~/lib/utils/storage";
import { Locale } from "~/types";

export const DISCOVERY_LOCATION_CHANGE_EVENT = "mndr:discovery-location";
export const DISCOVERY_LOCATION_STORAGE_KEY = "discovery-location";

export type DiscoveryLocation = {
  city: string;
  countryCode: "" | CountryCode;
};

export const EMPTY_DISCOVERY_LOCATION: DiscoveryLocation = { city: "", countryCode: "" };

export const isDiscoveryCountryCode = isCountryCode;

export const normalizeDiscoveryCity = (location: string) => location.split(",")[0]?.trim() ?? "";

const normalizeDiscoveryLocation = (location: Partial<DiscoveryLocation>): DiscoveryLocation => ({
  city: typeof location.city === "string" ? normalizeDiscoveryCity(location.city) : "",
  countryCode:
    typeof location.countryCode === "string" && isDiscoveryCountryCode(location.countryCode)
      ? location.countryCode
      : "",
});

export const getStoredDiscoveryLocation = (): DiscoveryLocation => {
  const stored = localStore.get<Partial<DiscoveryLocation>>(DISCOVERY_LOCATION_STORAGE_KEY);
  return stored ? normalizeDiscoveryLocation(stored) : EMPTY_DISCOVERY_LOCATION;
};

const emitDiscoveryLocationChange = (location: DiscoveryLocation) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent<DiscoveryLocation>(DISCOVERY_LOCATION_CHANGE_EVENT, { detail: location }));
};

export const saveDiscoveryLocation = (location: DiscoveryLocation): DiscoveryLocation => {
  const normalizedLocation = normalizeDiscoveryLocation(location);
  localStore.set(DISCOVERY_LOCATION_STORAGE_KEY, normalizedLocation);
  emitDiscoveryLocationChange(normalizedLocation);
  return normalizedLocation;
};

export const clearDiscoveryLocation = () => {
  localStore.remove(DISCOVERY_LOCATION_STORAGE_KEY);
  emitDiscoveryLocationChange(EMPTY_DISCOVERY_LOCATION);
  return EMPTY_DISCOVERY_LOCATION;
};

type DiscoveryLocationParam = "city" | "location";

const appendLocationToUrl = (href: string, location: DiscoveryLocation, locationParam: DiscoveryLocationParam) => {
  const url = new URL(href, "https://mandrii.local");

  if (location.countryCode) {
    url.searchParams.set("country", constants.whitelisted_countries[location.countryCode].label.en);
  }
  if (location.city) {
    url.searchParams.set(locationParam, location.city);
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

/** The venue, event and map routes use `city` as their local filter. */
export const appendDiscoveryLocationToUrl = (href: string, location: DiscoveryLocation) =>
  appendLocationToUrl(href, location, "city");

/** Community uses `location`, so retain locality without changing venue/event URL behaviour. */
export const appendDiscoveryCommunityLocationToUrl = (href: string, location: DiscoveryLocation) =>
  appendLocationToUrl(href, location, "location");

export const removeDiscoveryCityFromUrl = (href: string) => {
  const url = new URL(href, "https://mandrii.local");
  url.searchParams.delete("city");
  return `${url.pathname}${url.search}${url.hash}`;
};

export const getDiscoveryCountryLabel = (country: string, locale: Locale) => {
  const matchingCountry = Object.values(constants.whitelisted_countries).find(({ label }) => label.en === country);
  return matchingCountry?.label[locale] ?? country;
};
