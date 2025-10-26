"use client";

import { Grid3X3, List, MapPinOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { ActionButton, AnimatedEllipsis, EmptyState, Pagination, RichText } from "~/components/ui";
import { useListControls } from "~/hooks/useListControls";
import { getVenuesFilter, useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Venue_Category_Enum } from "~/types";

import { VenuesMasonryCard } from "../VenueCard/VenuesMasonryCard";
import { VenuesListFilter } from "./VenuesListFilter";
import { VenuesListCard } from "../VenueCard/VenuesListCard";

type LayoutSize = "full" | "half" | "small" | "third";
interface VenueWithLayout {
  hasImage: boolean;
  layoutSize: LayoutSize;
  venue: GetPublicVenuesQuery["venues"][number];
}

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

const generateVenueLayouts = (venues: GetPublicVenuesQuery["venues"], isNotLastPage: boolean): VenueWithLayout[] => {
  const layouts: VenueWithLayout[] = [];
  let itemIndex = 0;

  while (itemIndex < venues.length) {
    const remainingItems = venues.length - itemIndex;

    const hasImage = (index: number) => Boolean(venues[index].logo ?? venues[index].images?.length);

    if (isNotLastPage && remainingItems < 5) {
      if (remainingItems === 1) {
        // 1 venue - make it full width
        layouts.push({
          hasImage: hasImage(itemIndex),
          layoutSize: "full",
          venue: venues[itemIndex],
        });
        itemIndex++;
      } else if (remainingItems === 2) {
        // 2 venues - make them half width each (2 + 2 = 4 columns)
        for (let i = 0; i < 2; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            layoutSize: "half",
            venue: venues[itemIndex],
          });
          itemIndex++;
        }
      } else if (remainingItems === 3) {
        // 3 venues - one half and two small (2 + 1 + 1 = 4 columns)
        layouts.push({
          hasImage: hasImage(itemIndex),
          layoutSize: "half",
          venue: venues[itemIndex],
        });
        itemIndex++;
        for (let i = 0; i < 2; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            layoutSize: "small",
            venue: venues[itemIndex],
          });
          itemIndex++;
        }
      } else if (remainingItems === 4) {
        // 4 venues - all small (1 + 1 + 1 + 1 = 4 columns)
        for (let i = 0; i < 4; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            layoutSize: "small",
            venue: venues[itemIndex],
          });
          itemIndex++;
        }
      }
    } else {
      const pattern = LAYOUT_PATTERNS[Math.floor(Math.random() * LAYOUT_PATTERNS.length)];

      for (const segment of pattern) {
        for (let i = 0; i < segment.count && itemIndex < venues.length; i++) {
          layouts.push({
            hasImage: hasImage(itemIndex),
            layoutSize: segment.size,
            venue: venues[itemIndex],
          });
          itemIndex++;
        }
      }
    }
  }

  return layouts;
};

export const VenuesList = () => {
  const i18n = useI18n();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState<undefined | Venue_Category_Enum>();
  const [country, setCountry] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { useAvailableCountries, usePublicVenues } = useVenues();

  const { handleFilter, handlePaginate, listState } = useListControls({ limit: ITEMS_LIMIT });

  const { data: venues, loading, total } = usePublicVenues(listState);

  const { countries: availableCountries } = useAvailableCountries();

  // Calculate pagination
  const totalPages = useMemo(() => {
    if (!venues) return 0;
    return Math.ceil(total / ITEMS_LIMIT);
  }, [total, venues]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (newCategory: undefined | Venue_Category_Enum) => {
    setCategory(newCategory);
  };

  const handleCountryChange = (newCountry: string | undefined) => {
    setCountry(newCountry);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const { variables } = getVenuesFilter({
      category,
      country,
      name: searchQuery,
    });

    handleFilter(variables.where);
  }, [category, searchQuery, country, handleFilter]);

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
    const layouts = generateVenueLayouts(venues, currentPage < totalPages);

    return layouts;
  }, [venues, viewMode, listState.offset, totalPages]);

  return (
    <div className="flex flex-col gap-6">
      <VenuesListFilter
        availableCountries={availableCountries}
        category={category}
        country={country}
        onCategoryChange={handleCategoryChange}
        onCountryChange={handleCountryChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />

      <div className="flex flex-wrap items-center justify-between">
        <RichText as="div" className={`text-sm sm:text-base`}>
          {(() => {
            const currentOffset = listState.offset ?? 0;
            const start = currentOffset + 1;
            const end = Math.min(currentOffset + venues.length, total);

            return i18n("Showing **{start}**-**{end}** of **{total}** venues", {
              end: end,
              start: start,
              total: total,
            });
          })()}
        </RichText>

        <div className="bg-surface-tint flex gap-1 rounded-lg p-1">
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

      {loading && (
        <div
          className={`absolute inset-0 hidden items-center justify-center md:flex`}
          data-testid="spinner"
          style={{ marginTop: venues.length ? "0" : "5rem" }}
        >
          <AnimatedEllipsis size="md" />
        </div>
      )}

      {!loading && venues?.length === 0 ? (
        <EmptyState
          body={i18n("Try adjusting your filters or search terms")}
          heading={i18n("No venues found")}
          icon={<MapPinOff size={50} />}
        />
      ) : viewMode === "grid" ? (
        <div className={`grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
          {venueLayouts.map((item) => (
            <VenuesMasonryCard
              hasImage={item.hasImage}
              key={item.venue.id}
              layoutSize={item.layoutSize}
              venue={item.venue}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {venues.map((venue) => (
            <VenuesListCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Pagination
          index={(listState.offset ?? 0) / ITEMS_LIMIT + 1}
          loading={loading}
          nextText={i18n("Next")}
          onPaginate={handlePageChange}
          prevText={i18n("Back")}
          total={totalPages}
        />
      </div>
    </div>
  );
};
