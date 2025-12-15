import { LayoutDashboard } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo } from "react";

import { Input, Select } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { Event_Type_Enum, Locale, Price_Type_Enum } from "~/types";

interface VenuesListFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange: (dateFrom?: string) => void;
  onDateToChange: (dateTo?: string) => void;

  onPriceTypeChange: (priceType?: Price_Type_Enum) => void;
  onSearchChange: (query: string) => void;
  onTypeChange: (type?: Event_Type_Enum) => void;
  priceType?: Price_Type_Enum | undefined;
  searchQuery: string;
  type?: Event_Type_Enum;
}

export const EventsCatalogFilter = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onPriceTypeChange,
  onSearchChange,
  onTypeChange,
  priceType,
  searchQuery,
  type,
}: VenuesListFilterProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const eventTypeOptions = useMemo(
    () => [
      {
        label: (
          <div className="flex items-center gap-3">
            <LayoutDashboard size={16} />
            {i18n("All types")}
          </div>
        ),
        value: undefined,
      },
      ...Object.values(Event_Type_Enum).map((value) => {
        const { iconName, label } = constants.eventTypes[value as keyof typeof constants.eventTypes];

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

  const priceTypeOptions = useMemo(
    () => [
      {
        label: i18n("All price types"),
        value: undefined,
      },
      ...Object.values(Price_Type_Enum).map((value) => {
        const { label } = constants.priceTypes[value as keyof typeof constants.priceTypes];

        return {
          label: label[locale],
          value,
        };
      }),
    ],
    [i18n, locale],
  );

  return (
    <div className="mx-auto mt-4 w-full max-w-(--breakpoint-xl)">
      <div className="mb-6 space-y-3">
        <Input
          className="pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={i18n("Search events by title or location...")}
          type="search"
          value={searchQuery}
        />

        <div className={`grid grid-cols-2 gap-2 lg:grid-cols-4`}>
          <Select
            onChange={(e) => onTypeChange(e.target.value)}
            options={eventTypeOptions}
            placeholder={i18n("Type")}
            value={type}
          />
          <Select onChange={(e) => onPriceTypeChange(e.target.value)} options={priceTypeOptions} value={priceType} />
          <Input
            onChange={(e) => onDateFromChange(e.target.value)}
            placeholder={i18n("From")}
            type="date"
            value={dateFrom}
          />
          <Input onChange={(e) => onDateToChange(e.target.value)} placeholder={i18n("To")} type="date" value={dateTo} />
        </div>
      </div>
    </div>
  );
};
