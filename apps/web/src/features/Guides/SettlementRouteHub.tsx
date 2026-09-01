"use client";

import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Car,
  Clock3,
  FileText,
  HeartHandshake,
  HeartPulse,
  House,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo } from "react";

import { Badge, SectionCard, Select, TextLink } from "~/components/ui";
import { appendDiscoveryCommunityLocationToUrl } from "~/features/Discovery/discoveryLocation";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { CountryCode, isCountryCode } from "~/lib/constants/COUNTRIES";
import { getFlagComponent } from "~/lib/icons/flags";
import { Locale } from "~/types";

import { getSettlementRoute, type SettlementGuide } from "./settlementRoutes";
import { useSettlementCountry } from "./useSettlementCountry";

const stageIcons: Record<SettlementGuide["id"], LucideIcon> = {
  "children-and-school": BookOpen,
  "driving-and-car": Car,
  "everyday-life": ShoppingBag,
  healthcare: HeartPulse,
  "home-and-address": House,
  "status-and-documents": FileText,
  "study-and-qualifications": BookOpen,
  "work-and-money": BriefcaseBusiness,
};

type SettlementStageCardProps = {
  guide: SettlementGuide;
  index?: number;
};

const SettlementStageCard = ({ guide, index }: SettlementStageCardProps) => {
  const i18n = useI18n();
  const Icon = stageIcons[guide.id];
  const isPublished = guide.availability === "published" && Boolean(guide.href);

  return (
    <SectionCard className="border-on-surface/10 bg-surface hover:border-on-surface/10 hover:shadow-none">
      <div className="flex gap-3 sm:gap-4">
        {index ? (
          <span className="text-primary bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
            {String(index).padStart(2, "0")}
          </span>
        ) : (
          <span className="text-primary bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon aria-hidden size={19} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-on-surface font-semibold">{i18n(guide.titleKey)}</h3>
              {guide.descriptionKey && (
                <p className="text-neutral mt-1 text-sm leading-5">{i18n(guide.descriptionKey)}</p>
              )}
            </div>
            {isPublished ? (
              <TextLink className="shrink-0" href={guide.href!}>
                {i18n("Read guide")} <ArrowRight aria-hidden size={15} />
              </TextLink>
            ) : (
              <Badge
                className="shrink-0 self-start"
                icon={<Clock3 aria-hidden size={14} />}
                size="md"
                variant="neutral"
              >
                {i18n("Guide in preparation")}
              </Badge>
            )}
          </div>
          {!isPublished && <p className="text-neutral mt-3 text-xs">{i18n("It will be added soon.")}</p>}
        </div>
      </div>
    </SectionCard>
  );
};

const LocalHelp = ({ countryCode }: { countryCode: CountryCode }) => {
  const i18n = useI18n();
  const communityHref = appendDiscoveryCommunityLocationToUrl("/community", { city: "", countryCode });

  return (
    <SectionCard as="aside" className="mt-8" title={i18n("Need local help with one of these steps?")}>
      <p className="text-neutral mt-2 text-sm leading-6">
        {i18n("Ask a practical question, or offer what you know, in the community.")}
      </p>
      <TextLink className="mt-3" href={communityHref}>
        <HeartHandshake aria-hidden size={16} />
        {i18n("Ask the community")}
        <ArrowRight aria-hidden size={15} />
      </TextLink>
    </SectionCard>
  );
};

/**
 * A country-specific settlement route. It intentionally remains separate from
 * the discovery location so planning a move never changes nearby exploration.
 */
export function SettlementRouteHub() {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { countryCode, isReady, selectCountry } = useSettlementCountry();
  const country = countryCode ? constants.whitelisted_countries[countryCode] : null;
  const countryLabel = country?.label[locale];
  const route = getSettlementRoute(countryCode);

  const countryOptions = useMemo(
    () =>
      Object.entries(constants.whitelisted_countries).map(([code, optionCountry]) => {
        const Flag = getFlagComponent(code);

        return {
          label: (
            <span className="flex items-center gap-3">
              {Flag && <Flag className="h-4 w-6 rounded-sm shadow-sm" />}
              {optionCountry.label[locale]}
            </span>
          ),
          value: code as CountryCode,
        };
      }),
    [locale],
  );

  return (
    <section aria-labelledby="settlement-route-title" className="mb-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">{i18n("Settlement route")}</p>
          <h2 className="text-on-surface mt-1 text-2xl font-bold sm:text-3xl" id="settlement-route-title">
            {countryLabel ? i18n("Your route for {country}", { country: countryLabel }) : i18n("Choose a country")}
          </h2>
          <p className="text-neutral mt-2 text-sm leading-6">
            {i18n("A practical, country-specific order for getting established.")}
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Select
            aria-label={i18n("I'm settling in")}
            label={i18n("I'm settling in")}
            onChange={(event) => {
              if (isCountryCode(event.target.value)) {
                selectCountry(event.target.value);
              }
            }}
            options={countryOptions}
            placeholder={i18n("Choose a country")}
            value={countryCode}
          />
        </div>
      </div>

      {!isReady ? (
        <div aria-busy="true" className="border-on-surface/10 mt-6 flex min-h-28 items-center rounded-xl border px-4">
          <p className="text-neutral text-sm" role="status">
            {i18n("Preparing your settlement route...")}
          </p>
        </div>
      ) : !countryCode ? (
        <SectionCard className="mt-6">
          <p className="text-on-surface font-semibold">{i18n("Start with the country where you are settling.")}</p>
          <p className="text-neutral mt-1 text-sm leading-6">
            {i18n("This is separate from the location you use to discover nearby places and events.")}
          </p>
        </SectionCard>
      ) : !route ? (
        <>
          <SectionCard className="mt-6">
            <Badge icon={<Clock3 aria-hidden size={13} />} variant="neutral">
              {i18n("Guide in preparation")}
            </Badge>
            <h3 className="text-on-surface mt-3 font-semibold">
              {i18n("A route for {country} is on its way", { country: countryLabel! })}
            </h3>
            <p className="text-neutral mt-1 text-sm leading-6">
              {i18n(
                "It will follow the same practical structure - documents, home, healthcare, work and everyday life.",
              )}
            </p>
          </SectionCard>
          <LocalHelp countryCode={countryCode} />
        </>
      ) : (
        <>
          <ol className="mt-6 space-y-3" aria-label={i18n("Settlement steps")}>
            {route.coreStages.map((guide, index) => (
              <li key={guide.id}>
                <SettlementStageCard guide={guide} index={index + 1} />
              </li>
            ))}
          </ol>

          <section aria-labelledby="settlement-optional-stages" className="mt-8">
            <h3 className="text-on-surface text-lg font-semibold" id="settlement-optional-stages">
              {i18n("For your situation")}
            </h3>
            <p className="text-neutral mt-1 text-sm leading-6">{i18n("Use these paths only if they apply to you.")}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {route.optionalStages.map((guide) => (
                <SettlementStageCard guide={guide} key={guide.id} />
              ))}
            </div>
          </section>

          <SectionCard as="aside" className="mt-8" title={i18n("Plan for later")}>
            <p className="text-neutral mt-2 text-sm leading-6">
              {i18n("These tools are for longer-term decisions, not your first settlement steps.")}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <TextLink href="/guides/tools/ilr-calculator">{i18n("ILR calculator")}</TextLink>
              <TextLink href="/guides/tools/buy-vs-rent-calculator/gb">{i18n("Buy vs Rent calculator")}</TextLink>
            </div>
          </SectionCard>

          <LocalHelp countryCode={countryCode} />
        </>
      )}

      <div className="mt-6">
        <Link className="text-primary hover:text-primary-hover text-sm font-medium" href="/guides/tools">
          {i18n("Browse all tools")}
        </Link>
      </div>
    </section>
  );
}
