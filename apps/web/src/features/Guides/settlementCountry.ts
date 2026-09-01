import { getStoredDiscoveryLocation } from "~/features/Discovery/discoveryLocation";
import { CountryCode, isCountryCode } from "~/lib/constants/COUNTRIES";
import { localStore } from "~/lib/utils/storage";

export const SETTLEMENT_COUNTRY_STORAGE_KEY = "settlement-country";

export const getStoredSettlementCountry = (): "" | CountryCode => {
  const storedCountry = localStore.get<unknown>(SETTLEMENT_COUNTRY_STORAGE_KEY);

  if (typeof storedCountry === "string" && isCountryCode(storedCountry)) {
    return storedCountry;
  }

  return getStoredDiscoveryLocation().countryCode;
};

export const saveSettlementCountry = (countryCode: CountryCode) => {
  localStore.set(SETTLEMENT_COUNTRY_STORAGE_KEY, countryCode);
  return countryCode;
};
