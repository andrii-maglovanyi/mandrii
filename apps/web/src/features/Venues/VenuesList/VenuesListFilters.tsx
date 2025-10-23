"use client";

import { Grid3x3, LayoutDashboard, List, Search } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo } from "react";

import { Input, Select } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { Locale, Venue_Category_Enum } from "~/types";

interface VenuesListFiltersProps {
  availableCountries: string[];
  category?: undefined | Venue_Category_Enum;
  country?: string;
  onCategoryChange: (category: undefined | Venue_Category_Enum) => void;
  onCountryChange: (country: string | undefined) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  viewMode: ViewMode;
}

type ViewMode = "grid" | "list";

export const VenuesListFilters = ({
  availableCountries,
  category,
  country,
  onCategoryChange,
  onCountryChange,
  onSearchChange,
  onViewModeChange,
  searchQuery,
  viewMode,
}: VenuesListFiltersProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const categoryOptions = useMemo(
    () => [
      {
        label: (
          <div className="flex items-center gap-3">
            <LayoutDashboard size={16} />
            {i18n("All categories")}
          </div>
        ),
        value: "" as "" | Venue_Category_Enum,
      },
      ...Object.values(Venue_Category_Enum).map((value) => {
        const { iconName, label } = constants.categories[value as keyof typeof constants.categories];

        return {
          label: (
            <div className="flex items-center gap-3">
              {getIcon(iconName)}
              {label[locale]}
            </div>
          ),
          value,
        };
      }),
    ],
    [i18n, locale],
  );

  const countryOptions = useMemo(
    () => [
      {
        label: i18n("All countries"),
        value: "",
      },
      ...(availableCountries || []).map((countryName) => ({
        label: countryName,
        value: countryName,
      })),
    ],
    [availableCountries, i18n],
  );

  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
      {/* Search */}
      <div className={`flex-1 md:max-w-md`}>
        <div className="relative">
          <Search className={`text-neutral absolute top-1/2 left-3 -translate-y-1/2`} size={20} />
          <Input
            className="pl-10"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={i18n("Search venues...")}
            value={searchQuery}
          />
        </div>
      </div>

      {/* Category Select & Country Select & View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Select */}
        <div className="w-56">
          <Select
            onChange={(e) => {
              const value = e.target.value as "" | Venue_Category_Enum;
              onCategoryChange(value === "" ? undefined : value);
            }}
            options={categoryOptions}
            placeholder={i18n("All categories")}
            value={category || ("" as "" | Venue_Category_Enum)}
          />
        </div>

        {/* Country Select */}
        <div className="w-56">
          <Select
            onChange={(e) => {
              const value = e.target.value as string;
              onCountryChange(value === "" ? undefined : value);
            }}
            options={countryOptions}
            placeholder={i18n("All countries")}
            value={country || ""}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="bg-surface-tint ml-auto flex gap-1 rounded-lg p-1">
          <button
            aria-label={i18n("Grid view")}
            className={`rounded p-2 transition-colors ${
              viewMode === "grid" ? "bg-primary text-white" : `text-neutral hover:bg-primary/10`
            } `}
            onClick={() => onViewModeChange("grid")}
            type="button"
          >
            <Grid3x3 size={18} />
          </button>
          <button
            aria-label={i18n("List view")}
            className={`rounded p-2 transition-colors ${
              viewMode === "list" ? "bg-primary text-white" : `text-neutral hover:bg-primary/10`
            } `}
            onClick={() => onViewModeChange("list")}
            type="button"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
