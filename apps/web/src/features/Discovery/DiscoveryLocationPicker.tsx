"use client";

import { Globe2, MapPin, Pencil } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Button, LocationAutocomplete, Select } from "~/components/ui";
import { Modal } from "~/components/ui/Modal/Modal";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getFlagComponent } from "~/lib/icons/flags";
import { Locale } from "~/types";

import {
  DiscoveryLocation,
  EMPTY_DISCOVERY_LOCATION,
  isDiscoveryCountryCode,
  normalizeDiscoveryCity,
} from "./discoveryLocation";
import { useDiscoveryLocation } from "./useDiscoveryLocation";

type DiscoveryLocationPickerProps = {
  onChange?: (location: DiscoveryLocation) => void;
  variant?: "default" | "hero";
};

export function DiscoveryLocationPicker({ onChange, variant = "hero" }: Readonly<DiscoveryLocationPickerProps>) {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const { clearLocation, location, saveLocation } = useDiscoveryLocation();
  const [draft, setDraft] = useState<DiscoveryLocation>(EMPTY_DISCOVERY_LOCATION);

  useEffect(() => onChange?.(location), [location, onChange]);

  const countryOptions = useMemo(
    () => [
      {
        label: (
          <span className="flex items-center gap-3">
            <Globe2 className="text-primary" size={18} />
            {i18n("Everywhere")}
          </span>
        ),
        value: "",
      },
      ...Object.entries(constants.whitelisted_countries).map(([code, country]) => {
        const CountryFlag = getFlagComponent(code);

        return {
          label: (
            <span className="flex items-center gap-3">
              {CountryFlag && <CountryFlag className="h-4 w-6 rounded-sm shadow-sm" />}
              {country.label[locale]}
            </span>
          ),
          value: code,
        };
      }),
    ],
    [i18n, locale],
  );

  const locationLabel = useMemo(() => {
    const country = location.countryCode ? constants.whitelisted_countries[location.countryCode].label[locale] : "";
    return [location.city, country].filter(Boolean).join(", ") || i18n("Everywhere");
  }, [i18n, locale, location]);

  const open = () => {
    setDraft(location);
    setIsOpen(true);
  };

  const save = () => {
    saveLocation({ ...draft, city: normalizeDiscoveryCity(draft.city) });
    setIsOpen(false);
  };

  const clear = () => {
    clearLocation();
    setDraft(EMPTY_DISCOVERY_LOCATION);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={
          variant === "hero"
            ? "inline-flex min-h-12 w-full items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 sm:w-auto"
            : "border-neutral/30 bg-surface text-on-surface hover:border-primary/40 inline-flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors sm:w-auto"
        }
        onClick={open}
        type="button"
      >
        <MapPin size={16} />
        <span className="min-w-0 flex-1 truncate text-left sm:flex-none">
          {i18n("Looking in: {location}", { location: locationLabel })}
        </span>
        <Pencil className="shrink-0" size={14} />
      </button>

      <Modal className="mb-0" isOpen={isOpen} onClose={() => setIsOpen(false)} title={i18n("Choose where to explore")}>
        <div className="space-y-4">
          <p className="text-neutral text-sm">
            {i18n("This is saved only in this browser and can be changed anytime.")}
          </p>
          <Select
            label={i18n("Country")}
            onChange={(event) => {
              const value = event.target.value;
              setDraft((current) => ({
                city: current.countryCode === value ? current.city : "",
                countryCode: value && isDiscoveryCountryCode(value) ? value : "",
              }));
            }}
            options={countryOptions}
            value={draft.countryCode}
          />
          {isOpen && (
            <LocationAutocomplete
              includedRegionCodes={draft.countryCode ? [draft.countryCode] : undefined}
              label={i18n("City (optional)")}
              onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
              onLocationSelect={(city) => setDraft((current) => ({ ...current, city: normalizeDiscoveryCity(city) }))}
              placeholder={i18n("For example, London")}
              value={draft.city}
            />
          )}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
            <Button className="w-full justify-center sm:w-auto" color="neutral" onClick={clear} variant="ghost">
              {i18n("Clear location")}
            </Button>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button className="flex-1 sm:flex-none" onClick={() => setIsOpen(false)} variant="outlined">
                {i18n("Cancel")}
              </Button>
              <Button className="flex-1 sm:flex-none" color="primary" onClick={save}>
                {i18n("Save location")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
