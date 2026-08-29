"use client";

import { LayoutDashboard } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo } from "react";

import { Input, Select } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { Locale, Venue_Category_Enum } from "~/types";

interface VenuesListFilterProps {
  category?: undefined | Venue_Category_Enum;
  categoryCount?: number;
  country?: string;
  onCategoryChange: (category: undefined | Venue_Category_Enum) => void;
  onCountryChange: (country: string | undefined) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export const VenuesCatalogFilter = ({
  category,
  categoryCount = 0,
  country,
  onCategoryChange,
  onCountryChange,
  onSearchChange,
  searchQuery,
}: VenuesListFilterProps) => {
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
      ...Object.values(constants.whitelisted_countries).map((country) => ({
        label: country.label[locale],
        value: country.label.en,
      })),
    ],
    [i18n, locale],
  );

  return (
    <div className="mx-auto mt-4 w-full max-w-(--breakpoint-xl)">
      <div className="shrink-0 space-y-4">
        <div className={`flex flex-col gap-x-2 md:flex-row`}>
          <div className={`mb-4 flex-2 md:mb-0`}>
            <Input
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={i18n("Search venues by title or location...")}
              type="search"
              value={searchQuery}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:min-w-2/5">
            <div className="flex-1 sm:flex-3/5">
              <Select
                onChange={(e) => {
                  const value = e.target.value as "" | Venue_Category_Enum;
                  onCategoryChange(value === "" ? undefined : value);
                }}
                options={categoryOptions}
                placeholder={i18n("All categories")}
                selectedLabel={
                  categoryCount > 1 ? i18n("{count} categories selected", { count: categoryCount }) : undefined
                }
                value={category || ("" as "" | Venue_Category_Enum)}
              />
            </div>
            <div className="flex-1 sm:flex-2/5">
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
          </div>
        </div>
      </div>
    </div>
  );
};
