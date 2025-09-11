"use client";

import clsx from "clsx";
import {
  Book,
  Building,
  ChefHat,
  Church,
  Coffee,
  GalleryHorizontal,
  GraduationCap,
  Hospital,
  LayoutDashboard,
  LocateFixed,
  Music,
  ShoppingCart,
  Utensils,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { Button, Input, ProgressBar, RichText, Select } from "~/components/ui";
import { useTheme } from "~/contexts/ThemeContext";
import { useLocations } from "~/hooks/useLocations";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { Location_Category_Enum } from "~/types";
import { UUID } from "~/types/uuid";

import { BottomCard } from "./LocationCard/BottomCard";
import { ListCard } from "./LocationCard/ListCard";
import { GoogleMapRef, LocationsMap } from "./LocationsMap";

const WHITELISTED_COUNTRIES = ["uk", "nl", "ge"];
const LONDON_COORDINATES = {
  lat: 51.509865,
  lng: -0.118092,
};

type AutocompleteService = google.maps.places.AutocompleteService | null;

type AutocompleteToken = google.maps.places.AutocompleteSessionToken | null;
type Location = google.maps.LatLngLiteral | undefined;
interface LocationsProps {
  slug?: string;
}
type Suggestion = google.maps.places.AutocompletePrediction;

export const Locations = ({ slug }: LocationsProps) => {
  const i18n = useI18n();

  const CATEGORY_NAMES = useMemo(
    () => ({
      BEAUTY_SALON: { icon: <Wand2 size={16} />, label: i18n("Beauty salon") },
      CAFE: { icon: <Coffee size={16} />, label: i18n("Cafe") },
      CATERING: { icon: <ChefHat size={16} />, label: i18n("Catering") },
      CHURCH: { icon: <Church size={16} />, label: i18n("Church") },
      CLUB: { icon: <Music size={16} />, label: i18n("Club") },
      CULTURAL_CENTRE: {
        icon: <GalleryHorizontal size={16} />,
        label: i18n("Cultural centre"),
      },
      DENTAL_CLINIC: {
        icon: <Hospital size={16} />,
        label: i18n("Dental clinic"),
      },
      GROCERY_STORE: {
        icon: <ShoppingCart size={16} />,
        label: i18n("Grocery store"),
      },
      LIBRARY: { icon: <Book size={16} />, label: i18n("Library") },
      ORGANIZATION: {
        icon: <Building size={16} />,
        label: i18n("Organization"),
      },
      RESTAURANT: { icon: <Utensils size={16} />, label: i18n("Restaurant") },
      SCHOOL: { icon: <GraduationCap size={16} />, label: i18n("School") },
    }),
    [i18n],
  );

  const categoryOptions = useMemo(
    () => [
      {
        label: (
          <div className="flex items-center gap-3">
            <LayoutDashboard size={16} />
            {i18n("All categories")}
          </div>
        ),
        value: "" as Location_Category_Enum,
      },
      ...Object.values(Location_Category_Enum).map((category) => ({
        label: (
          <div className="flex items-center gap-3">
            {CATEGORY_NAMES[category].icon}
            {CATEGORY_NAMES[category].label}
          </div>
        ),
        value: category,
      })),
    ],
    [CATEGORY_NAMES, i18n],
  );

  const DISTANCES = useMemo(
    () =>
      [1000, 2000, 5000, 10000, 25000, 100000].map((value) => ({
        label: `${value / 1000}${i18n("km")}`,
        value: String(value),
      })),
    [i18n],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [locationSlug, setLocationSlug] = useState(slug);
  const [showMe, setShowMe] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { showError } = useNotifications();
  const [suggestions, setSuggestions] = useState<Array<Suggestion>>([]);
  const [userLocation, setUserLocation] = useState<Location>(LONDON_COORDINATES);
  const [selectedLocationId, setSelectedLocationId] = useState<null | UUID>(null);
  const [distance, setDistance] = useState(DISTANCES[DISTANCES.length - 1].value);
  const [category, setCategory] = useState<Location_Category_Enum>(categoryOptions[0].value);

  const { isDark } = useTheme();
  const { usePublicLocations } = useLocations();

  const mapRef = useRef<GoogleMapRef | null>(null);
  const sessionTokenRef = useRef<AutocompleteToken>(null);
  const mapServiceRef = useRef<AutocompleteService>(null);

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const { data, loading, total } = usePublicLocations({
    category,
    distance,
    geo: userLocation,
    slug: locationSlug,
  });

  const isReady = mapIsLoaded && !loading;

  const handleFocus = useCallback(() => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  // Justification for linter/sonarqube:
  // Geolocation is only requested in response to explicit user action ("Find me" button).
  // This is necessary for providing location-based search results.
  const getLocation = () => {
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

        sendToMixpanel("Selected Suggested Location", {
          ...coords,
          name: suggestions.find(({ place_id }) => place_id === id)?.description,
        });

        setUserLocation(coords);
        setLocationSlug("");
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
    if (slug && data.length === 1 && data[0].slug === slug) {
      const location = data[0];

      if (!location.geo) return;

      setUserLocation({
        lat: location.geo.coordinates[1],
        lng: location.geo.coordinates[0],
      });
      setDistance("1000");
      setSelectedLocationId(location.id);
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
          componentRestrictions: { country: WHITELISTED_COUNTRIES },
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

  const locationCards: Array<React.ReactNode> = [];
  let selectedCard: React.ReactNode = <></>;

  data.forEach((location) => {
    const card = (
      <ListCard
        key={location.id.toString()}
        location={location}
        onClick={() => {
          sendToMixpanel("Selected Location Card", {
            id: location.id,
            name: location.name,
          });
          setSelectedLocationId(location.id);
        }}
        selectedId={selectedLocationId}
      />
    );

    if (location.id === selectedLocationId) {
      selectedCard = <BottomCard location={location} />;
    }

    locationCards.push(card);
  });

  return (
    <div className="flex h-full grow flex-col">
      <div className="flex grow flex-row">
        <div className="flex grow flex-col">
          <div className="mx-auto mt-4 w-full max-w-(--breakpoint-xl) p-4">
            <div className="shrink-0 space-y-4">
              <div className={`
                flex flex-col gap-x-2
                md:flex-row
              `}>
                <div className={`
                  mb-4 flex-2
                  md:mb-0
                `}>
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
                  />
                </div>

                <div className="flex min-w-2/5 gap-2">
                  <div className="flex-3/5">
                    <Select
                      disabled={!isReady}
                      onChange={setCategory}
                      options={categoryOptions}
                      placeholder={i18n("Select category...")}
                      value={category}
                    />
                  </div>
                  <div className="flex-2/5">
                    <Select disabled={!isReady} onChange={setDistance} options={DISTANCES} value={distance} />
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
                <RichText as="div" className={clsx(`
                  text-sm
                  sm:text-base
                `, isReady ? `visible` : `hidden`)}>
                  {i18n("Added **{total}** places", { total })}
                </RichText>
              </div>
            </div>
          </div>

          <div className={clsx("mx-auto h-full w-1/2 flex-col justify-center", showMap ? `
            hidden
          ` : `flex`)}>
            <ProgressBar isLoading={!isReady} onLoaded={() => setShowMap(true)} />
          </div>

          <div className={clsx(`
            h-full grid-cols-1 gap-2
            md:grid-cols-2
          `, showMap ? `grid` : `hidden`)}>
            <div className={`
              hidden
              md:block
            `}>
              <div className={`
                -mt-[2px] h-[calc(100vh-230px)] w-[50vw] overflow-y-scroll px-3
              `}>{locationCards}</div>
            </div>

            <div className="relative col-span-1 h-full">
              <LocationsMap
                colorScheme={isDark ? "DARK" : "LIGHT"}
                distance={Number(distance)}
                locations={data}
                onLoaded={() => {
                  setMapIsLoaded(true);
                }}
                onLocationSelected={(id) => {
                  setSelectedLocationId(id);

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
                selectedLocationId={selectedLocationId}
                showMe={showMe}
                userLocation={userLocation}
              />

              <div className="absolute top-0 mt-3 ml-3">
                <p className={`
                  rounded-md bg-on-surface/70 px-3 py-1 text-sm text-surface
                `}>
                  {locationCards.length
                    ? `${i18n("Showing {number} results", { number: locationCards.length })}`
                    : i18n("Nothing found")}
                </p>
              </div>
              {selectedCard}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
