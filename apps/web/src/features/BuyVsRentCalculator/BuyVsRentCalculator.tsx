"use client";

import { useState } from "react";
import { BuyVsRentCalculatorGB } from "./BuyVsRentCalculatorGB";
import { BuyVsRentCalculatorDE } from "./BuyVsRentCalculatorDE";
import { sendToMixpanel } from "~/lib/mixpanel";
import { useI18n } from "~/i18n/useI18n";

type Country = "gb" | "de";

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

  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => handleCountryChange("gb")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
            country === "gb"
              ? "bg-primary text-surface shadow-md"
              : "bg-surface-light text-on-surface hover:bg-surface-lighter border-primary/20 border-2"
          }`}
        >
          <span className="text-lg">🇬🇧</span>
          {i18n("UK")}
        </button>
        <button
          onClick={() => handleCountryChange("de")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
            country === "de"
              ? "bg-primary text-surface shadow-md"
              : "bg-surface-light text-on-surface hover:bg-surface-lighter border-primary/20 border-2"
          }`}
        >
          <span className="text-lg">🇩🇪</span>
          {i18n("Germany")}
        </button>
      </div>

      {/* Calculator Components */}
      <div>
        {country === "gb" && <BuyVsRentCalculatorGB />}
        {country === "de" && <BuyVsRentCalculatorDE />}
      </div>
    </div>
  );
};
