"use client";

import { useCallback, useEffect, useState } from "react";

import { CountryCode } from "~/lib/constants/COUNTRIES";

import { getStoredSettlementCountry, saveSettlementCountry } from "./settlementCountry";

/**
 * The settlement country is intentionally independent from the discovery
 * location. A person can explore one city while planning a move elsewhere.
 */
export const useSettlementCountry = () => {
  const [countryCode, setCountryCode] = useState<"" | CountryCode>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setCountryCode(getStoredSettlementCountry());
    setIsReady(true);
  }, []);

  const selectCountry = useCallback((nextCountryCode: CountryCode) => {
    setCountryCode(saveSettlementCountry(nextCountryCode));
  }, []);

  return { countryCode, isReady, selectCountry };
};
