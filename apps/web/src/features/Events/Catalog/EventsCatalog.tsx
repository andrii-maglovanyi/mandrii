"use client";

import { Grid3X3, List, MapPinOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useDebouncedCallback } from "use-debounce";

import { ActionButton, AnimatedEllipsis, Pagination, RichText } from "~/components/ui";
import { LocationResultsFallback } from "~/features/Discovery/LocationResultsFallback";
import { generateCatalogLayouts } from "~/features/shared/Catalog/layoutConfig";
import { useEvents } from "~/hooks/useEvents";
import { useListControls } from "~/hooks/useListControls";
import { useI18n } from "~/i18n/useI18n";
import { Event_Type_Enum, GetPublicEventsQuery, Price_Type_Enum } from "~/types";

import { EventsListCard } from "../EventCard/EventsListCard";
import { EventsMasonryCard } from "../EventCard/EventsMasonryCard";
import { getEventDatePreset } from "../utils/getEventDatePreset";
import { getEventsFilter } from "../utils/getEventsFilter";
import { removeDiscoveryCityFromUrl } from "~/features/Discovery/discoveryLocation";
import { EventsCatalogFilter } from "./EventsCatalogFilter";

type ViewMode = "grid" | "list";

const ITEMS_LIMIT = 12;
const SEARCH_DEBOUNCE_MS = 300;

export const EventsCatalog = () => {
  const i18n = useI18n();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const querySearch = searchParams.get("q") ?? "";
  const datePreset = useMemo(() => getEventDatePreset(searchParams.get("when")), [searchParamsKey]);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [type, setType] = useState<Event_Type_Enum | undefined>();
  const [priceType, setPriceType] = useState<Price_Type_Enum | undefined>();
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
    setDateFrom(datePreset?.dateFrom);
    setDateTo(datePreset?.dateTo);
  }, [datePreset, querySearch]);

  const { usePublicEvents } = useEvents();

  const { handleFilter, handlePaginate, listState } = useListControls({ limit: ITEMS_LIMIT });

  const { count, data: events, loading } = usePublicEvents(listState);

  // Calculate pagination
  const countPages = useMemo(() => {
    if (!events) return 0;
    return Math.ceil(count / ITEMS_LIMIT);
  }, [count, events]);

  // Debounce search to avoid hammering the API
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, SEARCH_DEBOUNCE_MS);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetSearch(query);
  };

  useEffect(() => {
    const { variables } = getEventsFilter({
      city,
      country,
      dateFrom,
      dateTo,
      name: debouncedSearch,
      priceType,
      type,
    });

    handleFilter(variables.where);
  }, [type, priceType, city, country, debouncedSearch, dateFrom, dateTo, handleFilter]);

  const handlePageChange = (pageIndex: number) => {
    const actualOffset = (pageIndex - 1) * ITEMS_LIMIT;
    handlePaginate({ offset: actualOffset });

    // Only scroll to top on desktop (numbered pagination)
    if (!isMobile) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  const eventLayouts = useMemo(() => {
    if (!events || viewMode !== "grid") return [];

    const currentPage = Math.floor((listState.offset ?? 0) / ITEMS_LIMIT) + 1;
    const layouts = generateCatalogLayouts<GetPublicEventsQuery["events"][number]>(events, currentPage < countPages);

    return layouts;
  }, [events, viewMode, countPages, listState.offset]);

  return (
    <div className="flex flex-col gap-6">
      <EventsCatalogFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onPriceTypeChange={setPriceType}
        onSearchChange={handleSearchChange}
        onTypeChange={setType}
        priceType={priceType}
        searchQuery={searchQuery}
        type={type}
      />

      <div className="flex flex-wrap items-center justify-between">
        {count ? (
          <RichText as="div" className={`text-sm sm:text-base`}>
            {(() => {
              const currentOffset = listState.offset ?? 0;
              const start = currentOffset + 1;
              const end = Math.min(currentOffset + events.length, count);

              return i18n("Showing **{start}**-**{end}** of **{count}** items", {
                count,
                end,
                start,
              });
            })()}
          </RichText>
        ) : (
          <div />
        )}

        <div className={`bg-surface-tint hidden gap-1 rounded-lg p-1 lg:flex`}>
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

      {!loading && events?.length === 0 ? (
        <LocationResultsFallback
          city={city}
          country={country}
          fallbackHref={locationFallbackHref}
          heading={i18n("No events found")}
          icon={<MapPinOff size={50} />}
        />
      ) : viewMode === "grid" && !isMobile ? (
        <div className={`grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
          {eventLayouts.map((layout) => (
            <EventsMasonryCard
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
            <EventsListCard event={event} key={event.id} />
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
          index={(listState.offset ?? 0) / ITEMS_LIMIT + 1}
          loading={loading}
          nextText={i18n("Next")}
          onPaginate={handlePageChange}
          prevText={i18n("Back")}
        />
      </div>
    </div>
  );
};
