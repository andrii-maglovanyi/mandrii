import { beforeEach, describe, expect, it } from "vitest";

import { saveDiscoveryLocation } from "~/features/Discovery/discoveryLocation";

import { getStoredSettlementCountry, saveSettlementCountry, SETTLEMENT_COUNTRY_STORAGE_KEY } from "./settlementCountry";

describe("settlementCountry", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("initially uses the discovery country without coupling future changes to it", () => {
    saveDiscoveryLocation({ city: "Amsterdam", countryCode: "nl" });

    expect(getStoredSettlementCountry()).toBe("nl");

    saveSettlementCountry("gb");
    saveDiscoveryLocation({ city: "Berlin", countryCode: "de" });

    expect(getStoredSettlementCountry()).toBe("gb");
  });

  it("ignores an invalid stored country and falls back to the discovery country", () => {
    saveDiscoveryLocation({ city: "London", countryCode: "gb" });
    window.localStorage.setItem(`mndr.${SETTLEMENT_COUNTRY_STORAGE_KEY}`, JSON.stringify("invalid"));

    expect(getStoredSettlementCountry()).toBe("gb");
  });
});
