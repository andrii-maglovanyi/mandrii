"use client";

import { MapPinOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { AnimatedEllipsis, EmptyState, Pagination } from "~/components/ui";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Venue_Category_Enum, Venue_Status_Enum } from "~/types";

import { VenueMasonryCard } from "./VenueMasonryCard";
import { VenuesListFilters } from "./VenuesListFilters";
import { VenuesTileCard } from "./VenuesTileCard";

type LayoutSize = "full" | "half" | "small" | "third";
interface VenueWithLayout {
  hasImage: boolean;
  layoutSize: LayoutSize;
  venue: GetPublicVenuesQuery["venues"][number];
}

type ViewMode = "grid" | "list";

// Layout patterns optimized for 4-column grid (mobile: 1, tablet: 2, desktop: 4)
const LAYOUT_PATTERNS = [
  [{ count: 1, size: "full" as LayoutSize }], // 1 full-width (spans all 4 columns)
  [{ count: 2, size: "half" as LayoutSize }], // 2 cards (each spans 2 columns)
  [{ count: 4, size: "small" as LayoutSize }], // 4 small cards (each 1 column)
  [
    { count: 1, size: "half" as LayoutSize },
    { count: 2, size: "small" as LayoutSize },
  ], // 1 half (2 cols) + 2 small (1 col each)
  [
    { count: 2, size: "small" as LayoutSize },
    { count: 1, size: "half" as LayoutSize },
  ], // 2 small + 1 half
];

/**
 * Generate random layout configuration for venues.
 * Assigns random sizes and image presence to create variety.
 * Ensures rows on the last page always fill the full width.
 *
 * @param venues - Array of venues to layout
 * @param isLastPage - Whether this is the last page of results
 */
const generateVenueLayouts = (venues: GetPublicVenuesQuery["venues"], isLastPage: boolean): VenueWithLayout[] => {
  const layouts: VenueWithLayout[] = [];
  let venueIndex = 0;

  while (venueIndex < venues.length) {
    const remainingVenues = venues.length - venueIndex;

    // On the last page, use patterns that guarantee full-width rows
    if (isLastPage) {
      if (remainingVenues === 1) {
        // 1 venue - make it full width
        layouts.push({
          hasImage: Math.random() > 0.3,
          layoutSize: "full",
          venue: venues[venueIndex],
        });
        venueIndex++;
      } else if (remainingVenues === 2) {
        // 2 venues - make them half width each (2 + 2 = 4 columns)
        for (let i = 0; i < 2; i++) {
          layouts.push({
            hasImage: Math.random() > 0.3,
            layoutSize: "half",
            venue: venues[venueIndex],
          });
          venueIndex++;
        }
      } else if (remainingVenues === 3) {
        // 3 venues - one half and two small (2 + 1 + 1 = 4 columns)
        layouts.push({
          hasImage: Math.random() > 0.3,
          layoutSize: "half",
          venue: venues[venueIndex],
        });
        venueIndex++;
        for (let i = 0; i < 2; i++) {
          layouts.push({
            hasImage: Math.random() > 0.3,
            layoutSize: "small",
            venue: venues[venueIndex],
          });
          venueIndex++;
        }
      } else if (remainingVenues === 4) {
        // 4 venues - all small (1 + 1 + 1 + 1 = 4 columns)
        for (let i = 0; i < 4; i++) {
          layouts.push({
            hasImage: Math.random() > 0.3,
            layoutSize: "small",
            venue: venues[venueIndex],
          });
          venueIndex++;
        }
      } else if (remainingVenues >= 5) {
        // 5 or more venues - use guaranteed full-width patterns
        if (remainingVenues >= 8) {
          // Enough for multiple rows - use 4 small cards (full row)
          for (let i = 0; i < 4; i++) {
            layouts.push({
              hasImage: Math.random() > 0.3,
              layoutSize: "small",
              venue: venues[venueIndex],
            });
            venueIndex++;
          }
        } else {
          // 5-7 venues - use a combination that fills rows
          // First row: 4 small cards
          for (let i = 0; i < 4 && venueIndex < venues.length; i++) {
            layouts.push({
              hasImage: Math.random() > 0.3,
              layoutSize: "small",
              venue: venues[venueIndex],
            });
            venueIndex++;
          }
          // Handle remaining 1-3 venues in the next iteration
        }
      }
    } else {
      // Not last page - use random patterns for variety
      const pattern = LAYOUT_PATTERNS[Math.floor(Math.random() * LAYOUT_PATTERNS.length)];

      // Apply pattern to venues
      for (const segment of pattern) {
        for (let i = 0; i < segment.count && venueIndex < venues.length; i++) {
          layouts.push({
            // 70% chance of having an image (random variety)
            hasImage: Math.random() > 0.3,
            layoutSize: segment.size,
            venue: venues[venueIndex],
          });
          venueIndex++;
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { usePublicVenues } = useVenues();

  // Build filter params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterParams: any = {
    where: {
      _and: [
        { status: { _eq: Venue_Status_Enum.Active } }, // Only show active venues
        ...(category ? [{ category: { _eq: category } }] : []),
        ...(country ? [{ country: { _eq: country } }] : []),
        ...(searchQuery
          ? [
              {
                _or: [{ name: { _ilike: `%${searchQuery}%` } }, { address: { _ilike: `%${searchQuery}%` } }],
              },
            ]
          : []),
      ],
    },
  };

  const { data: venues, loading } = usePublicVenues(filterParams);

  // Extract unique countries from venues for filter dropdown
  const availableCountries = useMemo(() => {
    if (!venues) return [];

    const countries = new Set<string>();
    venues.forEach((venue) => {
      // @ts-expect-error - country field added to query but types not regenerated yet
      if (venue.country) {
        // @ts-expect-error - country field added to query but types not regenerated yet
        countries.add(venue.country);
      }
    });

    return Array.from(countries).sort();
  }, [venues]);

  // Calculate pagination
  const totalPages = useMemo(() => {
    if (!venues) return 0;
    return Math.ceil(venues.length / itemsPerPage);
  }, [venues]);

  // Get paginated venues
  // For mobile: accumulate all venues up to current page (infinite scroll)
  // For desktop: show only current page venues (traditional pagination)
  const displayedVenues = useMemo(() => {
    if (!venues) return [];

    if (isMobile) {
      // Mobile: show all venues from page 1 to current page (accumulated)
      const endIndex = currentPage * itemsPerPage;
      return venues.slice(0, endIndex);
    } else {
      // Desktop: show only current page venues
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return venues.slice(startIndex, endIndex);
    }
  }, [venues, currentPage, isMobile]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, country, searchQuery]);

  // Reset to page 1 when switching between mobile/desktop
  useEffect(() => {
    setCurrentPage(1);
  }, [isMobile]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Only scroll to top on desktop (numbered pagination)
    if (!isMobile) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  // Generate layouts for masonry grid
  const venueLayouts = useMemo(() => {
    if (!displayedVenues || viewMode !== "grid") return [];

    // Check if this is the last page based on total venues and current page
    const isLastPage = currentPage >= totalPages;

    // On desktop, check if the displayed venues don't fill complete rows
    const hasIncompleteLastRow = displayedVenues.length % 4 !== 0;

    // Apply special layout only if it's the last page AND has an incomplete last row
    const shouldFillLastRow = isLastPage && hasIncompleteLastRow;

    const layouts = generateVenueLayouts(displayedVenues, shouldFillLastRow);

    // Debug: Log layout info
    console.log("� Layout generation:", {
      totalVenues: displayedVenues.length,
      currentPage,
      totalPages,
      isLastPage,
      hasIncompleteLastRow,
      shouldFillLastRow,
      layoutSizes: layouts.map((l) => l.layoutSize),
    });

    return layouts;
  }, [displayedVenues, viewMode, currentPage, totalPages]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <AnimatedEllipsis size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1
            className={`from-primary to-secondary mb-2 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl`}
          >
            {i18n("Discover Venues")}
          </h1>
          <p className="text-neutral">{i18n("Explore Ukrainian venues and community spaces around the world")}</p>
        </div>

        {/* Filters */}
        <VenuesListFilters
          availableCountries={availableCountries}
          category={category}
          country={country}
          onCategoryChange={handleCategoryChange}
          onCountryChange={handleCountryChange}
          onSearchChange={handleSearchChange}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          viewMode={viewMode}
        />
      </div>

      {/* Results Count */}
      {venues && venues.length > 0 && (
        <div className="text-neutral text-sm">
          {isMobile
            ? // Mobile: show accumulated count
              i18n("Showing {count} of {total} venues", {
                count: Math.min(currentPage * itemsPerPage, venues.length),
                total: venues.length,
              })
            : // Desktop: show page range
              i18n("Showing {start}-{end} of {total} venues", {
                end: Math.min(currentPage * itemsPerPage, venues.length),
                start: (currentPage - 1) * itemsPerPage + 1,
                total: venues.length,
              })}
        </div>
      )}

      {/* Venues Grid/List */}
      {!venues || venues.length === 0 ? (
        <EmptyState
          body={i18n("Try adjusting your filters or search terms")}
          heading={i18n("No venues found")}
          icon={<MapPinOff size={50} />}
        />
      ) : viewMode === "grid" ? (
        // Masonry Grid Layout
        <>
          <div className={`grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
            {venueLayouts.map((item) => (
              <VenueMasonryCard
                hasImage={item.hasImage}
                key={item.venue.id}
                layoutSize={item.layoutSize}
                venue={item.venue}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                index={currentPage}
                loading={loading}
                nextText={i18n("Next")}
                onPaginate={handlePageChange}
                prevText={i18n("Back")}
                total={totalPages}
              />
            </div>
          )}
        </>
      ) : (
        // List View
        <>
          <div className="flex flex-col gap-4">
            {displayedVenues.map((venue) => (
              <VenuesTileCard key={venue.id} venue={venue} viewMode={viewMode} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                index={currentPage}
                loading={loading}
                nextText={i18n("Next")}
                onPaginate={handlePageChange}
                prevText={i18n("Back")}
                total={totalPages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
