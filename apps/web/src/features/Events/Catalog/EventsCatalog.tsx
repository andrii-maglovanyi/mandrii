"use client";

import { Grid3X3, List, MapPinOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { ActionButton, AnimatedEllipsis, EmptyState, Pagination, RichText } from "~/components/ui";
import { getEventsFilter, useEvents } from "~/hooks/useEvents";
import { useListControls } from "~/hooks/useListControls";
import { useI18n } from "~/i18n/useI18n";
import { Event_Type_Enum, GetPublicEventsQuery, Price_Type_Enum } from "~/types";

import { EventsListCard } from "../EventCard/EventsListCard";
import { EventsMasonryCard } from "../EventCard/EventsMasonryCard";
import { EventsCatalogFilter } from "./EventsCatalogFilter";

interface EventWithLayout {
  event: GetPublicEventsQuery["events"][number];
  hasImage: boolean;
  layoutSize: LayoutSize;
}

type LayoutSize = "full" | "half" | "small" | "third";

type ViewMode = "grid" | "list";

const ITEMS_LIMIT = 12;

const LAYOUT_PATTERNS: Array<Array<{ count: number; size: LayoutSize }>> = [
  [{ count: 1, size: "full" }],
  [{ count: 2, size: "half" }],
  [{ count: 4, size: "small" }],
  [
    { count: 1, size: "half" },
    { count: 2, size: "small" },
  ],
  [
    { count: 2, size: "small" },
    { count: 1, size: "half" },
  ],
];

const generateEventLayouts = (events: GetPublicEventsQuery["events"], isNotLastPage: boolean): EventWithLayout[] => {
  const layouts: EventWithLayout[] = [];
  let itemIndex = 0;

  while (itemIndex < events.length) {
    const remainingItems = events.length - itemIndex;

    const hasImage = (index: number) => Boolean(events[index].images?.length);

    if (isNotLastPage && remainingItems < 5) {
      if (remainingItems === 1) {
        // 1 event - make it full width
        layouts.push({
          event: events[itemIndex],
          hasImage: hasImage(itemIndex),
          layoutSize: "full",
        });
        itemIndex++;
      } else if (remainingItems === 2) {
        // 2 events - make them half width each
        for (let i = 0; i < 2; i++) {
          layouts.push({
            event: events[itemIndex],
            hasImage: hasImage(itemIndex),
            layoutSize: "half",
          });
          itemIndex++;
        }
      } else if (remainingItems === 3) {
        // 3 events - one half and two small
        layouts.push({
          event: events[itemIndex],
          hasImage: hasImage(itemIndex),
          layoutSize: "half",
        });
        itemIndex++;
        for (let i = 0; i < 2; i++) {
          layouts.push({
            event: events[itemIndex],
            hasImage: hasImage(itemIndex),
            layoutSize: "small",
          });
          itemIndex++;
        }
      } else if (remainingItems === 4) {
        // 4 events - all small
        for (let i = 0; i < 4; i++) {
          layouts.push({
            event: events[itemIndex],
            hasImage: hasImage(itemIndex),
            layoutSize: "small",
          });
          itemIndex++;
        }
      }
    } else {
      const pattern = LAYOUT_PATTERNS[Math.floor(Math.random() * LAYOUT_PATTERNS.length)];

      for (const segment of pattern) {
        for (let i = 0; i < segment.count && itemIndex < events.length; i++) {
          layouts.push({
            event: events[itemIndex],
            hasImage: hasImage(itemIndex),
            layoutSize: segment.size,
          });
          itemIndex++;
        }
      }
    }
  }

  return layouts;
};

export const EventsCatalog = () => {
  const i18n = useI18n();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [type, setType] = useState<Event_Type_Enum | undefined>();
  const [priceType, setPriceType] = useState<Price_Type_Enum | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  const { usePublicEvents } = useEvents();

  const { handleFilter, handlePaginate, listState } = useListControls({ limit: ITEMS_LIMIT });

  const { count, data: events, loading } = usePublicEvents(listState);

  // Calculate pagination
  const countPages = useMemo(() => {
    if (!events) return 0;
    return Math.ceil(count / ITEMS_LIMIT);
  }, [count, events]);

  useEffect(() => {
    const { variables } = getEventsFilter({
      dateFrom,
      dateTo,
      name: searchQuery,
      priceType,
      type,
    });

    handleFilter(variables.where);
  }, [type, priceType, searchQuery, dateFrom, dateTo, handleFilter]);

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
    const layouts = generateEventLayouts(events, currentPage < countPages);

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
        onSearchChange={setSearchQuery}
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

              return i18n("Showing **{start}**-**{end}** of **{count}** events", {
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
        <EmptyState
          body={i18n("Try adjusting your filters or search terms")}
          heading={i18n("No events found")}
          icon={<MapPinOff size={50} />}
        />
      ) : viewMode === "grid" && !isMobile ? (
        <div className={`grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
          {eventLayouts.map((item) => (
            <EventsMasonryCard
              event={item.event}
              hasImage={item.hasImage}
              key={item.event.id}
              layoutSize={item.layoutSize}
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
