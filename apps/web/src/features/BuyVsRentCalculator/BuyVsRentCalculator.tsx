"use client";

import { useState } from "react";
import { BuyVsRentCalculatorGB } from "./BuyVsRentCalculatorGB";
import { BuyVsRentCalculatorDE } from "./BuyVsRentCalculatorDE";
import { BuyVsRentCalculatorPL } from "./BuyVsRentCalculatorPL";
import { sendToMixpanel } from "~/lib/mixpanel";
import { useI18n } from "~/i18n/useI18n";
import { getFlagComponent } from "~/lib/icons/flags";
import { Button } from "~/components/ui";

type Country = "gb" | "de" | "pl";

interface BuyVsRentCalculatorProps {
  initialCountry?: Country;
}

export const BuyVsRentCalculator = ({ initialCountry = "gb" }: BuyVsRentCalculatorProps) => {
  const [country, setCountry] = useState<Country>(initialCountry);
  const i18n = useI18n();

  const handleCountryChange = (newCountry: Country) => {
    if (newCountry !== country) {
      setCountry(newCountry);
      sendToMixpanel("Buy vs Rent Calculator Country Changed", {
        from: country,
        to: newCountry,
        source: "buy_vs_rent_calculator",
      });
    }
  };

  const CountryFlagGB = getFlagComponent("uk");
  const CountryFlagDE = getFlagComponent("de");
  const CountryFlagPL = getFlagComponent("pl");

  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => handleCountryChange("gb")}
          className="gap-2"
          color={country === "gb" ? "primary" : "neutral"}
          variant={country === "gb" ? "outlined" : "ghost"}
        >
          {CountryFlagGB ? <CountryFlagGB className="h-4 w-5 rounded-sm" /> : <span className="text-lg">🇬🇧</span>}
          {i18n("UK")}
        </Button>
        <Button
          onClick={() => handleCountryChange("de")}
          className="gap-2"
          color={country === "de" ? "primary" : "neutral"}
          variant={country === "de" ? "outlined" : "ghost"}
        >
          {CountryFlagDE ? <CountryFlagDE className="h-4 w-5 rounded-sm" /> : <span className="text-lg">🇩🇪</span>}
          {i18n("Germany")}
        </Button>
        <Button
          onClick={() => handleCountryChange("pl")}
          className="gap-2"
          color={country === "pl" ? "primary" : "neutral"}
          variant={country === "pl" ? "outlined" : "ghost"}
        >
          {CountryFlagPL ? <CountryFlagPL className="h-4 w-5 rounded-sm" /> : <span className="text-lg">🇵🇱</span>}
          {i18n("Poland")}
        </Button>
      </div>

      {/* Calculator Components */}
      <div>
        {country === "gb" && <BuyVsRentCalculatorGB />}
        {country === "de" && <BuyVsRentCalculatorDE />}
        {country === "pl" && <BuyVsRentCalculatorPL />}
      </div>
    </div>
  );
};
