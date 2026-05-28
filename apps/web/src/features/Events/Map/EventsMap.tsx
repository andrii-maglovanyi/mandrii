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
import { useEvents } from "~/hooks/useEvents";
import { useListControls } from "~/hooks/useListControls";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { Event_Type_Enum, Locale } from "~/types";
import { UUID } from "~/types/uuid";

import { MapListCard } from "../EventCard/MapListCard";
import { MapMobileCard } from "../EventCard/MapMobileCard";
import { getEventsFilter } from "../utils/getEventsFilter";
import { GoogleMapRef, PinMap } from "./PinMap";

type AutocompleteToken = google.maps.places.AutocompleteSessionToken | null;
type Location = google.maps.LatLngLiteral | undefined;
type Suggestion = google.maps.places.AutocompleteSuggestion;

const MAX_DISTANCE = 100000;

export const EventsMap = () => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { data: session } = useUser();
  const { openCustomDialog } = useDialog();

  const isAuthenticated = !!session;

  const eventTypeOptions = useMemo(
    () => [
      {
        label: (
          <div className="flex items-center gap-3">
            <LayoutDashboard size={16} />
            {i18n("All types")}
          </div>
        ),
        value: undefined,
      },
      ...Object.values(Event_Type_Enum).map((value) => {
        const { iconName, label } = constants.eventTypes[value as keyof typeof constants.eventTypes];

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
  const [showMe, setShowMe] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { showError } = useNotifications();
  const [suggestions, setSuggestions] = useState<Array<Suggestion>>([]);
  const [userLocation, setUserLocation] = useState<Location>(constants.london_coordinates);
  const [selectedEventId, setSelectedEventId] = useState<null | UUID>(null);
  const [distance, setDistance] = useState(String(MAX_DISTANCE));
  const [type, setType] = useState<Event_Type_Enum | undefined>(eventTypeOptions[0].value);

  const { isDark } = useTheme();
  const { variables } = getEventsFilter({
    distance,
    geo: userLocation,
    type,
  });

  const { handleFilter, listState } = useListControls({
    ...variables,
    limit: 50,
  });
  const { usePublicEvents } = useEvents();

  const mapRef = useRef<GoogleMapRef | null>(null);
  const sessionTokenRef = useRef<AutocompleteToken>(null);

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const { count, data, loading, total } = usePublicEvents(listState);

  // Filter events to only show those with geo data (in-person events)
  // Events can have geo data either directly or through their venue
  const eventsWithGeo = useMemo(() => {
    return data.filter((event) => Boolean(event.geo || event.venue?.geo));
  }, [data]);

  const isReady = mapIsLoaded && !loading;

  const handleFocus = useCallback(() => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  const handleAddEvent = useCallback(() => {
    sendToMixpanel("Clicked Add Event", {
      authenticated: isAuthenticated,
      source: "map_page",
    });

    if (isAuthenticated) {
      router.push("/user-directory/events");
    } else {
      openCustomDialog({
        children: <SignInForm callbackUrl="/user-directory/events" />,
      });
    }
  }, [isAuthenticated, router, openCustomDialog]);

  // SECURITY: Using geolocation is justified and necessary.
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

  const fetchPlaceDetails = async (placeId: string) => {
    const place = new google.maps.places.Place({
      id: placeId,
      requestedLanguage: locale,
    });

    try {
      await place.fetchFields({ fields: ["location"] });
    } catch (e) {
      console.error(e);
      throw new Error(i18n("Could not get place details."));
    }

    return place;
  };

  const handleSelectSuggestion = async (id: string) => {
    setSuggestions([]);

    try {
      const place = await fetchPlaceDetails(id);
      const location = place.location;

      if (location) {
        const coords = { lat: location.lat(), lng: location.lng() };

        sendToMixpanel("Selected Suggested Location", {
          ...coords,
          name: suggestions.find((s) => s.placePrediction?.placeId === id)?.placePrediction?.text.text,
        });

        setUserLocation(coords);
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
    const { variables } = getEventsFilter({
      distance,
      geo: userLocation,
      isOnline: false,
      type,
    });

    handleFilter(variables.where);
  }, [type, distance, userLocation, handleFilter]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!isReady || !searchTerm) {
        setSuggestions([]);
        return;
      }

      if (searchTerm.length > 2) {
        try {
          const res = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: searchTerm,
            sessionToken: sessionTokenRef.current ?? undefined,
          });

          setSuggestions(res?.suggestions ?? []);
        } catch (e) {
          console.error(e);
          setSuggestions([]);
        }
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, isReady]);

  const eventCards: Array<React.ReactNode> = [];
  let selectedCard: React.ReactNode = <></>;

  for (const event of eventsWithGeo) {
    const card = (
      <MapListCard
        event={event}
        key={String(event.id)}
        onClick={() => {
          sendToMixpanel("Selected Event Card", {
            id: event.id,
            name: event.title_en ?? event.title_uk,
          });
          setSelectedEventId(event.id);
        }}
        selectedId={selectedEventId}
      />
    );

    if (event.id === selectedEventId) {
      selectedCard = <MapMobileCard event={event} />;
    }

    eventCards.push(card);
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
                    placeholder={i18n("Search street, city, or region...")}
                    suggestions={suggestions
                      .filter((s) => s.placePrediction !== null)
                      .map((s) => ({
                        label: s.placePrediction!.text.text,
                        value: s.placePrediction!.placeId,
                      }))}
                    type="search"
                  />
                </div>

                <div className="flex min-w-2/5 gap-2">
                  <div className="flex-3/5">
                    <Select
                      disabled={!isReady}
                      onChange={(e) => setType(e.target.value)}
                      options={eventTypeOptions}
                      placeholder={i18n("Select event type...")}
                      value={type}
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
              {!(eventCards?.length || loading) ? (
                <div className="flex h-full w-full items-center justify-center">
                  <EmptyState
                    body={i18n("Try adjusting your filters or search location")}
                    heading={i18n("No events found")}
                    icon={<MapPinOff size={50} />}
                  />
                </div>
              ) : (
                <div className={`-mt-0.5 h-[calc(100vh-230px)] w-[50vw] overflow-y-scroll px-3 pt-0.5`}>
                  {eventCards}
                </div>
              )}
            </div>

            <div className="relative col-span-1 h-full">
              <PinMap
                colorScheme={isDark ? "DARK" : "LIGHT"}
                distance={Number(distance)}
                drawRadius
                events={eventsWithGeo}
                onClick={() => {
                  setSelectedEventId(null);
                }}
                onEventSelected={(id: UUID) => {
                  setSelectedEventId(id);

                  if (!isMobile) {
                    const ref = document.getElementById(id);
                    setTimeout(() => {
                      ref?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }
                }}
                onLoaded={() => {
                  setMapIsLoaded(true);
                }}
                ref={mapRef}
                selectedEventId={selectedEventId}
                showMe={showMe}
                userLocation={userLocation}
              />

              <div className="absolute top-0 left-0 mt-3 ml-3">
                <p className={`bg-on-surface/70 text-surface rounded-md px-3 py-1 text-sm`}>
                  {eventCards.length
                    ? `${i18n("Showing {number} results", { number: eventCards.length })}`
                    : i18n("Nothing found")}
                </p>
              </div>

              <div className="absolute top-0 right-0 mt-3 mr-3">
                <Button
                  className="border-on-surface text-on-surface! animate-[gradientShift_5s_ease_infinite] gap-2 rounded-2xl! border-2 bg-[linear-gradient(270deg,#f9556d,#9670f7,#4d94f8,#20c997)] bg-size-[300%_300%] p-5 font-bold shadow-xl"
                  color="primary"
                  onClick={handleAddEvent}
                  size="sm"
                  variant="filled"
                >
                  {isAuthenticated ? (
                    <>
                      <Plus size={16} strokeWidth={4} />
                      {i18n("Add event")}
                    </>
                  ) : (
                    <>
                      <LogIn size={16} strokeWidth={4} />
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
