"use client";

import { Grid3X3, List, MapPinOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { useDebouncedCallback } from "use-debounce";

import { ActionButton, Alert, AnimatedEllipsis, Pagination, RichText } from "~/components/ui";
import { removeDiscoveryCityFromUrl } from "~/features/Discovery/discoveryLocation";
import { LocationResultsFallback } from "~/features/Discovery/LocationResultsFallback";
import { generateCatalogLayouts } from "~/features/shared/Catalog/layoutConfig";
import { useEventDiscovery } from "~/hooks/useEventDiscovery";
import { useI18n } from "~/i18n/useI18n";
import { INFINITE_SCROLL_MEDIA_QUERY } from "~/lib/responsive";
import { Event_Type_Enum, GetPublicEventsQuery, Price_Type_Enum } from "~/types";

import { EventsListCard } from "../EventCard/EventsListCard";
import { EventsMasonryCard } from "../EventCard/EventsMasonryCard";
import { getEventDatePreset } from "../utils/getEventDatePreset";
import { getEventsFilter } from "../utils/getEventsFilter";
import { EventsCatalogFilter } from "./EventsCatalogFilter";

type ViewMode = "grid" | "list";

const ITEMS_LIMIT = 12;
const SEARCH_DEBOUNCE_MS = 300;

export const EventsCatalog = () => {
  const i18n = useI18n();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const usesInfiniteScroll = useMediaQuery({ query: INFINITE_SCROLL_MEDIA_QUERY });
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const querySearch = searchParams.get("q") ?? "";
  const when = searchParams.get("when");
  const datePreset = useMemo(() => getEventDatePreset(when), [when]);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [type, setType] = useState<Event_Type_Enum | undefined>();
  const [priceType, setPriceType] = useState<Price_Type_Enum | undefined>();
  const [includePast, setIncludePast] = useState(false);
  const [searchQuery, setSearchQuery] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [dateFrom, setDateFrom] = useState<string | undefined>(datePreset?.dateFrom);
  const [dateTo, setDateTo] = useState<string | undefined>(datePreset?.dateTo);
  const city = searchParams.get("city") ?? undefined;
  const country = searchParams.get("country") ?? undefined;
  const locationFallbackHref = useMemo(
    () => (city && country ? removeDiscoveryCityFromUrl(`/events?${searchParamsKey}`) : undefined),
    [city, country, searchParamsKey],
  );

  useEffect(() => {
    setSearchQuery(querySearch);
    setDebouncedSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
    setDateFrom(datePreset?.dateFrom);
    setDateTo(datePreset?.dateTo);
  }, [datePreset]);

  const where = useMemo(
    () =>
      getEventsFilter({
        city,
        country,
        dateFrom,
        dateTo,
        includePast,
        name: debouncedSearch,
        priceType,
        type,
      }).variables.where,
    [city, country, dateFrom, dateTo, debouncedSearch, priceType, includePast, type],
  );
  const filterKey = JSON.stringify(where);
  const [pagination, setPagination] = useState({ key: filterKey, offset: 0 });
  const offset = pagination.key === filterKey ? pagination.offset : 0;
  const {
    count: displayedCount,
    data: events,
    error,
    loading,
  } = useEventDiscovery({
    from: dateFrom,
    includePast,
    limit: usesInfiniteScroll ? offset + ITEMS_LIMIT : ITEMS_LIMIT,
    offset: usesInfiniteScroll ? 0 : offset,
    to: dateTo,
    where,
  });

  // Calculate pagination
  const countPages = useMemo(() => {
    return Math.ceil(displayedCount / ITEMS_LIMIT);
  }, [displayedCount]);

  // Debounce search to avoid hammering the API
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, SEARCH_DEBOUNCE_MS);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetSearch(query);
  };

  const handlePageChange = (pageIndex: number) => {
    const actualOffset = (pageIndex - 1) * ITEMS_LIMIT;
    setPagination({ key: filterKey, offset: actualOffset });

    // Only scroll to top on desktop (numbered pagination)
    if (!usesInfiniteScroll) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  const eventLayouts = useMemo(() => {
    if (!events || viewMode !== "grid") return [];

    const currentPage = Math.floor(offset / ITEMS_LIMIT) + 1;
    const layouts = generateCatalogLayouts<GetPublicEventsQuery["events"][number]>(events, currentPage < countPages);

    return layouts;
  }, [events, viewMode, countPages, offset]);

  return (
    <div className="flex flex-col gap-6">
      <EventsCatalogFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        includePast={includePast}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onIncludePastChange={setIncludePast}
        onPriceTypeChange={setPriceType}
        onSearchChange={handleSearchChange}
        onTypeChange={setType}
        priceType={priceType}
        searchQuery={searchQuery}
        type={type}
      />

      <div className="flex flex-wrap items-center justify-between">
        {displayedCount ? (
          <RichText as="div" className={`
            text-sm
            sm:text-base
          `}>
            {(() => {
              const currentOffset = offset ?? 0;
              const start = usesInfiniteScroll ? 1 : currentOffset + 1;
              const end = Math.min(currentOffset + ITEMS_LIMIT, displayedCount);

              return i18n("Showing **{start}**-**{end}** of **{count}** items", {
                count: displayedCount,
                end,
                start,
              });
            })()}
          </RichText>
        ) : (
          <div />
        )}

        <div className={`
          hidden gap-1 rounded-lg bg-surface-tint p-1
          lg:flex
        `}>
          <ActionButton
            aria-label={i18n("Grid view")}
            color="primary"
            icon={<Grid3X3 />}
            onClick={() => setViewMode("grid")}
            variant={viewMode === "grid" ? "filled" : "ghost"}
          />

          <ActionButton
            aria-label={i18n("List view")}
            color="primary"
            icon={<List />}
            onClick={() => setViewMode("list")}
            variant={viewMode === "list" ? "filled" : "ghost"}
          />
        </div>
      </div>

      {error ? (
        <Alert variant="warning">{i18n("Events are not available at the moment")}</Alert>
      ) : !loading && events?.length === 0 ? (
        <LocationResultsFallback
          city={city}
          country={country}
          fallbackHref={locationFallbackHref}
          heading={i18n("No events found")}
          icon={<MapPinOff size={50} />}
        />
      ) : viewMode === "grid" && !isMobile ? (
        <div className={`
          grid auto-rows-auto grid-cols-1 gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        `}>
          {eventLayouts.map((layout) => (
            <EventsMasonryCard
              analyticsSource="catalog"
              event={layout.item}
              hasImage={layout.hasImage}
              key={layout.item.id}
              layoutSize={layout.layoutSize}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <EventsListCard analyticsSource="catalog" event={event} key={event.id} />
          ))}
        </div>
      )}

      {loading && !events.length && (
        <div className="flex items-center justify-center" data-testid="spinner">
          <AnimatedEllipsis size="md" />
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Pagination
          count={countPages}
          index={offset / ITEMS_LIMIT + 1}
          loading={loading}
          nextText={i18n("Next")}
          onPaginate={handlePageChange}
          prevText={i18n("Back")}
        />
      </div>
    </div>
  );
};
