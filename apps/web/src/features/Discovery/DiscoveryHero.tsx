"use client";

import { CalendarDays, HeartHandshake, Map, ShoppingBasket, Sparkles, Stethoscope, UsersRound } from "lucide-react";
import { useCallback, useState } from "react";

import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";

import { appendDiscoveryLocationToUrl, DiscoveryLocation } from "./discoveryLocation";
import { DiscoveryLocationPicker } from "./DiscoveryLocationPicker";

type DiscoveryIntent = {
  description: string;
  href: string;
  icon: typeof CalendarDays;
  title: string;
};

export function DiscoveryHero() {
  const i18n = useI18n();
  const [location, setLocation] = useState<DiscoveryLocation>({ city: "", countryCode: "" });

  const intents: DiscoveryIntent[] = [
    {
      description: i18n("Find Ukrainian events happening soon"),
      href: "/events?when=weekend",
      icon: CalendarDays,
      title: i18n("Tonight & this weekend"),
    },
    {
      description: i18n("Discover cafés, restaurants, shops and more"),
      href: "/venues?categories=RESTAURANT,CAFE,GROCERY_STORE,SHOP",
      icon: ShoppingBasket,
      title: i18n("Food & shopping"),
    },
    {
      description: i18n("Find trusted places for you and your family"),
      href: "/venues?categories=SCHOOL,CULTURAL_CENTRE,CAFE",
      icon: UsersRound,
      title: i18n("With children"),
    },
    {
      description: i18n("Find Ukrainian-speaking professionals and services"),
      href: "/venues?categories=MEDICAL,LEGAL_SERVICE,BEAUTY_SALON,ORGANIZATION",
      icon: Stethoscope,
      title: i18n("Useful services"),
    },
    {
      description: i18n("Find culture, gatherings and community spaces"),
      href: "/venues?categories=CULTURAL_CENTRE,CHURCH,LIBRARY,ORGANIZATION,THEATRE",
      icon: Sparkles,
      title: i18n("Culture & community"),
    },
    {
      description: i18n("Practical guides for starting life in a new country"),
      href: "/guides",
      icon: HeartHandshake,
      title: i18n("Settling abroad"),
    },
  ];

  const withLocation = useCallback((href: string) => appendDiscoveryLocationToUrl(href, location), [location]);

  const locationChange = useCallback((nextLocation: DiscoveryLocation) => setLocation(nextLocation), []);

  return (
    <section className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 py-4 md:py-10">
      <div className="from-ukraine-blue-700 via-ukraine-blue-500 to-ukraine-yellow-500 dark:from-ukraine-blue-950 dark:via-ukraine-blue-700 dark:to-ukraine-yellow-600 relative overflow-hidden rounded-2xl bg-linear-to-br px-5 py-9 text-center shadow-lg sm:rounded-3xl sm:px-6 sm:py-10 md:px-12 md:py-16">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-white/80 uppercase sm:text-sm sm:tracking-[0.2em]">
            {i18n("For Ukrainians abroad")}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            {i18n("Your Ukrainian community, wherever you are")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
            {i18n("Find trusted places, events and practical support from Ukrainians near you.")}
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <DiscoveryLocationPicker onChange={locationChange} />
            <Link
              className="text-ukraine-blue-700 hover:bg-ukraine-blue-50 dark:bg-neutral-0 dark:text-ukraine-blue-700 dark:hover:bg-ukraine-blue-50 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold no-underline shadow-sm transition-transform hover:-translate-y-0.5 hover:no-underline hover:shadow-md sm:w-auto"
              href={withLocation("/map")}
            >
              <Map size={18} />
              {i18n("Explore near you")}
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{i18n("What are you looking for?")}</h2>
          <p className="text-on-surface/70 mt-2">{i18n("Choose a starting point and explore your local community.")}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {intents.map(({ description, href, icon: Icon, title }) => (
            <Link
              className="group border-on-surface/10 bg-surface-tint/60 hover:border-primary/50 text-on-surface rounded-2xl border p-5 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:no-underline hover:shadow-md sm:p-6"
              href={href === "/guides" ? href : withLocation(href)}
              key={title}
            >
              <span className="bg-primary/10 text-primary group-hover:!bg-primary/20 group-hover:!text-primary mb-4 inline-flex rounded-xl p-3 transition-colors">
                <Icon size={22} />
              </span>
              <h3 className="group-hover:text-primary text-lg font-bold transition-colors">{title}</h3>
              <p className="text-on-surface/70 mt-1 text-sm leading-6">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
