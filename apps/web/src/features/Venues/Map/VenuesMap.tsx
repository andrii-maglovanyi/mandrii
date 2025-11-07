"use client";

import clsx from "clsx";
import { LayoutDashboard, LocateFixed, LogIn, MapPinOff, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { SignInForm } from "~/components/layout/Auth/SignInForm";
import { Button, EmptyState, Input, ProgressBar, RichText, Select } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useTheme } from "~/contexts/ThemeContext";
import { useListControls } from "~/hooks/useListControls";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { getVenuesFilter, useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { Locale, Venue_Category_Enum } from "~/types";
import { UUID } from "~/types/uuid";

import { MapListCard } from "../VenueCard/MapListCard";
import { MapMobileCard } from "../VenueCard/MapMobileCard";
import { GoogleMapRef, PinMap } from "./PinMap";

type AutocompleteService = google.maps.places.AutocompleteService | null;

type AutocompleteToken = google.maps.places.AutocompleteSessionToken | null;
type Location = google.maps.LatLngLiteral | undefined;
type Suggestion = google.maps.places.AutocompletePrediction;
interface VenuesProps {
  slug?: string;
}

const MAX_DISTANCE = 100000;

export const VenuesMap = ({ slug }: VenuesProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { data: session } = useUser();
  const { openCustomDialog } = useDialog();

  const isAuthenticated = !!session;

  const categoryOptions = useMemo(
    () => [
      {
        label: (
          <div className="flex items-center gap-3">
            <LayoutDashboard size={16} />
            {i18n("All categories")}
          </div>
        ),
        value: undefined,
      },
      ...Object.values(Venue_Category_Enum).map((value) => {
        const { iconName, label } = constants.categories[value as keyof typeof constants.categories];

        return {
          label: (
            <div className="flex items-center gap-3">
              {getIcon(iconName)}
              {label[locale]}
            </div>
          ),
          value,
        };
      }),
    ],
    [i18n, locale],
  );

  const DISTANCES = useMemo(
    () =>
      [1000, 2000, 5000, 10000, 25000, MAX_DISTANCE].map((value) => ({
        label: `${value / 1000}${i18n("km")}`,
        value: String(value),
      })),
    [i18n],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [venueSlug, setVenueSlug] = useState(slug);
  const [showMe, setShowMe] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { showError } = useNotifications();
  const [suggestions, setSuggestions] = useState<Array<Suggestion>>([]);
  const [userLocation, setUserLocation] = useState<Location>(constants.london_coordinates);
  const [selectedVenueId, setSelectedVenueId] = useState<null | UUID>(null);
  const [distance, setDistance] = useState(String(MAX_DISTANCE));
  const [category, setCategory] = useState<undefined | Venue_Category_Enum>(categoryOptions[0].value);

  const { isDark } = useTheme();
  const { variables } = getVenuesFilter({
    category,
    distance,
    geo: userLocation,
    slug: venueSlug,
  });

  const { handleFilter, listState } = useListControls({
    limit: 50,
    where: variables.where,
  });
  const { usePublicVenues } = useVenues();

  const mapRef = useRef<GoogleMapRef | null>(null);
  const sessionTokenRef = useRef<AutocompleteToken>(null);
  const mapServiceRef = useRef<AutocompleteService>(null);

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const { count, data, loading, total } = usePublicVenues(listState);

  const isReady = mapIsLoaded && !loading;

  const handleFocus = useCallback(() => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  const handleAddVenue = useCallback(() => {
    sendToMixpanel("Clicked Add Venue", {
      authenticated: isAuthenticated,
      source: "map_page",
    });

    if (isAuthenticated) {
      router.push("/user-directory/venues");
    } else {
      openCustomDialog({
        children: <SignInForm callbackUrl="/user-directory/venues" />,
      });
    }
  }, [isAuthenticated, router, openCustomDialog]);

  // SECURITY: Using geolocation is justified and necessary.
  // - Triggered only by explicit user action (clicking the "Find me" button).
  // - Used exclusively to center map/search results near the user's position.
  // - Location data is not stored, transmitted, or shared with third parties.
  // - Complies with browser permission prompts for user consent.
  const getLocation = async () => {
    if ("permissions" in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: "geolocation" });

        if (permissionStatus.state === "denied") {
          showError(i18n("Location access denied. Please enable it in your browser settings."));
          return;
        }

        permissionStatus.addEventListener("change", () => {
          console.log("Geolocation permission changed to:", permissionStatus.state);
        });
      } catch (error) {
        console.warn("Permissions API not available:", error);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDistance(DISTANCES[3].value);

          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowMe(true);
        },
        (error) => {
          console.error(error);
          showError(i18n("Unable to find your location. Please try searching!"));
        },
      );
    } else {
      showError(i18n("Unable to find your location. Please try searching!"));
    }
  };

  const fetchPlaceDetails = (placeId: string) => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) {
      setSuggestions([]);
      throw new Error(i18n("Map is not available yet. Please wait until it loads"));
    }

    const service = new google.maps.places.PlacesService(mapInstance);

    return new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
      service.getDetails(
        {
          fields: ["geometry"],
          placeId,
          sessionToken: sessionTokenRef.current ?? undefined,
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            console.error(status);
            reject(new Error(i18n("Could not get place details.")));
          }
        },
      );
    });
  };

  const handleSelectSuggestion = async (id: string) => {
    setSuggestions([]);

    try {
      const { geometry } = await fetchPlaceDetails(id);
      const { lat, lng } = geometry?.location ?? {};

      if (lat && lng) {
        const coords = { lat: lat(), lng: lng() };

        sendToMixpanel("Selected Suggested Venue", {
          ...coords,
          name: suggestions.find(({ place_id }) => place_id === id)?.description,
        });

        setUserLocation(coords);
        setVenueSlug("");
      }
      setShowMe(false);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      } else if (error === "OVER_QUERY_LIMIT") {
        showError(i18n("You've made too many searches in a short time. Please wait a minute and try again."), {
          header: i18n("Whoa, slow down!"),
        });
      } else {
        showError(i18n("Oops, try again"));
      }
    }
  };

  useEffect(() => {
    if (isReady) {
      mapServiceRef.current = new google.maps.places.AutocompleteService();
    }
  }, [isReady]);

  useEffect(() => {
    const { variables } = getVenuesFilter({
      category,
      distance,
      geo: userLocation,
      slug: venueSlug,
    });

    handleFilter(variables.where);
  }, [category, distance, userLocation, venueSlug, handleFilter]);

  useEffect(() => {
    if (slug && data.length === 1 && data[0].slug === slug) {
      const venue = data[0];

      if (!venue.geo) return;

      setUserLocation({
        lat: venue.geo.coordinates[1],
        lng: venue.geo.coordinates[0],
      });
      setDistance("1000");
      setSelectedVenueId(venue.id);
    }
  }, [slug, data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!mapServiceRef.current || !searchTerm) {
        setSuggestions([]);
        return;
      }

      if (searchTerm.length > 2) {
        const request: google.maps.places.AutocompletionRequest = {
          componentRestrictions: { country: Object.keys(constants.whitelisted_countries) },
          input: searchTerm,
          sessionToken: sessionTokenRef.current ?? undefined,
        };

        mapServiceRef.current.getPlacePredictions(request, (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result?.length) {
            setSuggestions(result);
          } else {
            setSuggestions([]);
          }
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const venueCards: Array<React.ReactNode> = [];
  let selectedCard: React.ReactNode = <></>;

  for (const venue of data) {
    const card = (
      <MapListCard
        key={venue.id.toString()}
        onClick={() => {
          sendToMixpanel("Selected Venue Card", {
            id: venue.id,
            name: venue.name,
          });
          setSelectedVenueId(venue.id);
        }}
        selectedId={selectedVenueId}
        venue={venue}
      />
    );

    if (venue.id === selectedVenueId) {
      selectedCard = <MapMobileCard venue={venue} />;
    }

    venueCards.push(card);
  }

  return (
    <div className="bg-surface z-10 flex h-full grow flex-col">
      <div className="flex grow flex-row">
        <div className="flex grow flex-col">
          <div className="mx-auto mt-4 w-full max-w-(--breakpoint-xl) p-4">
            <div className="shrink-0 space-y-4">
              <div className={`flex flex-col gap-x-2 md:flex-row`}>
                <div className={`mb-4 flex-2 md:mb-0`}>
                  <Input
                    disabled={!isReady}
                    onChange={(e) => {
                      const term = e.target.value;
                      sendToMixpanel("Searched Location", { term });
                      setSearchTerm(term);
                    }}
                    onFocus={handleFocus}
                    onSelectSuggestion={handleSelectSuggestion}
                    placeholder={i18n("Location")}
                    suggestions={suggestions.map(({ description, place_id }) => ({
                      label: description,
                      value: place_id,
                    }))}
                    type="search"
                  />
                </div>

                <div className="flex min-w-2/5 gap-2">
                  <div className="flex-3/5">
                    <Select
                      disabled={!isReady}
                      onChange={(e) => setCategory(e.target.value)}
                      options={categoryOptions}
                      placeholder={i18n("Select category...")}
                      value={category}
                    />
                  </div>
                  <div className="flex-2/5">
                    <Select
                      disabled={!isReady}
                      onChange={(e) => setDistance(e.target.value)}
                      options={DISTANCES}
                      value={distance}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    aria-label={i18n("Find me")}
                    onClick={() => {
                      getLocation();
                      sendToMixpanel("Clicked Find Me");
                    }}
                    size="sm"
                  >
                    <LocateFixed className="mr-2" size={18} /> {i18n("Find me")}
                  </Button>
                </div>
                <RichText as="div" className={clsx(`text-sm sm:text-base`, isReady ? `visible` : `hidden`)}>
                  {i18n("Showing **{count}** of **{total}**", { count, total })}
                </RichText>
              </div>
            </div>
          </div>

          <div className={clsx("mx-auto h-full w-1/2 flex-col justify-center", showMap ? `hidden` : `flex`)}>
            <ProgressBar isLoading={!isReady} onLoaded={() => setShowMap(true)} />
          </div>

          <div className={clsx(`h-full grid-cols-1 gap-2 md:grid-cols-2`, showMap ? `grid` : `hidden`)}>
            <div className={`hidden md:block`}>
              {!(venueCards?.length || loading) ? (
                <div className="flex h-full w-full items-center justify-center">
                  <EmptyState
                    body={i18n("Try adjusting your filters or search terms")}
                    heading={i18n("No venues found")}
                    icon={<MapPinOff size={50} />}
                  />
                </div>
              ) : (
                <div className={`-mt-0.5 h-[calc(100vh-230px)] w-[50vw] overflow-y-scroll px-3 pt-0.5`}>
                  {venueCards}
                </div>
              )}
            </div>

            <div className="relative col-span-1 h-full">
              <PinMap
                colorScheme={isDark ? "DARK" : "LIGHT"}
                distance={Number(distance)}
                drawRadius
                onLoaded={() => {
                  setMapIsLoaded(true);
                }}
                onVenueSelected={(id) => {
                  setSelectedVenueId(id);

                  if (!isMobile) {
                    setTimeout(() => {
                      document.getElementById(String(id))?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 200);
                  }
                }}
                ref={mapRef}
                selectedVenueId={selectedVenueId}
                showMe={showMe}
                userLocation={userLocation}
                venues={data}
              />

              <div className="absolute top-0 left-0 mt-3 ml-3">
                <p className={`bg-on-surface/70 text-surface rounded-md px-3 py-1 text-sm`}>
                  {venueCards.length
                    ? `${i18n("Showing {number} results", { number: venueCards.length })}`
                    : i18n("Nothing found")}
                </p>
              </div>

              <div className="absolute top-0 right-0 mt-3 mr-3">
                <Button className="gap-2" color="primary" onClick={handleAddVenue} size="sm" variant="filled">
                  {isAuthenticated ? (
                    <>
                      <Plus size={16} />
                      {i18n("Add venue")}
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      {i18n("Sign in to add venue")}
                    </>
                  )}
                </Button>
              </div>

              {selectedCard}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
