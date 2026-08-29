"use client";

import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";

import { Button, EmptyState } from "~/components/ui";
import { useRouter } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

import { getDiscoveryCountryLabel } from "./discoveryLocation";

interface LocationResultsFallbackProps {
  city?: string;
  country?: string;
  fallbackHref?: string;
  heading: string;
  icon: React.ReactNode;
}

export function LocationResultsFallback({
  city,
  country,
  fallbackHref,
  heading,
  icon,
}: Readonly<LocationResultsFallbackProps>) {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const countryLabel = country ? getDiscoveryCountryLabel(country, locale) : undefined;
  const fallback =
    city && countryLabel && fallbackHref ? { city, country: countryLabel, href: fallbackHref } : undefined;

  return (
    <div className="flex flex-col items-center">
      <EmptyState
        body={
          fallback
            ? i18n("We couldn't find matches in {city}. Try the wider country instead.", { city: fallback.city })
            : i18n("Try adjusting your filters or search terms")
        }
        heading={heading}
        icon={icon}
      />
      {fallback && (
        <Button className="gap-2" color="primary" onClick={() => router.push(fallback.href)}>
          {i18n("Show all in {country}", { country: fallback.country })}
          <ArrowRight size={17} />
        </Button>
      )}
    </div>
  );
}
