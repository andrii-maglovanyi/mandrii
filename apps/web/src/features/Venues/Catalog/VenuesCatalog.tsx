"use client";

import { Grid3X3, List, MapPinOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useDebouncedCallback } from "use-debounce";

import { ActionButton, AnimatedEllipsis, EmptyState, Pagination, RichText } from "~/components/ui";
import { generateCatalogLayouts } from "~/features/shared/Catalog/layoutConfig";
import { useListControls } from "~/hooks/useListControls";
import { getVenuesFilter, useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Venue_Category_Enum } from "~/types";

import { VenuesListCard } from "../VenueCard/VenuesListCard";
import { VenuesMasonryCard } from "../VenueCard/VenuesMasonryCard";
import { VenuesCatalogFilter } from "./VenuesCatalogFilter";

type ViewMode = "grid" | "list";

const ITEMS_LIMIT = 12;
const SEARCH_DEBOUNCE_MS = 300;

export const VenuesCatalog = () => {
  const i18n = useI18n();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState<undefined | Venue_Category_Enum>();
  const [country, setCountry] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { usePublicVenues } = useVenues();

  const { handleFilter, handlePaginate, listState } = useListControls({ limit: ITEMS_LIMIT });

  const { count, data: venues, loading } = usePublicVenues(listState);

  // Calculate pagination
  const countPages = useMemo(() => {
    if (!venues) return 0;
    return Math.ceil(count / ITEMS_LIMIT);
  }, [count, venues]);

  // Debounce search to avoid hammering the API
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, SEARCH_DEBOUNCE_MS);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetSearch(query);
  };

  useEffect(() => {
    const { variables } = getVenuesFilter({
      category,
      country,
      name: debouncedSearch,
    });

    handleFilter(variables.where);
  }, [category, debouncedSearch, country, handleFilter]);

  const handlePageChange = (pageIndex: number) => {
    const actualOffset = (pageIndex - 1) * ITEMS_LIMIT;
    handlePaginate({ offset: actualOffset });

    // Only scroll to top on desktop (numbered pagination)
    if (!isMobile) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  const venueLayouts = useMemo(() => {
    if (!venues || viewMode !== "grid") return [];

    const currentPage = Math.floor((listState.offset ?? 0) / ITEMS_LIMIT) + 1;
    const layouts = generateCatalogLayouts<GetPublicVenuesQuery["venues"][number]>(venues, currentPage < countPages);

    return layouts;
  }, [venues, viewMode, listState.offset, countPages]);

  return (
    <div className="flex flex-col gap-6">
      <VenuesCatalogFilter
        category={category}
        country={country}
        onCategoryChange={setCategory}
        onCountryChange={setCountry}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />

      <div className="flex flex-wrap items-center justify-between">
        {count ? (
          <RichText as="div" className={`text-sm sm:text-base`}>
            {(() => {
              const currentOffset = listState.offset ?? 0;
              const start = currentOffset + 1;
              const end = Math.min(currentOffset + venues.length, count);

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

      {!loading && venues?.length === 0 ? (
        <EmptyState
          body={i18n("Try adjusting your filters or search terms")}
          heading={i18n("No venues found")}
          icon={<MapPinOff size={50} />}
        />
      ) : viewMode === "grid" && !isMobile ? (
        <div className={`grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
          {venueLayouts.map((layout) => (
            <VenuesMasonryCard
              hasImage={layout.hasImage}
              key={layout.item.id}
              layoutSize={layout.layoutSize}
              showFlag={!country}
              venue={layout.item}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {venues.map((venue) => (
            <VenuesListCard key={venue.id} showFlag={!country} venue={venue} />
          ))}
        </div>
      )}

      {loading && !venues.length && (
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
