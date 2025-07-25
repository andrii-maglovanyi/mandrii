import { GoogleMap, Libraries, useJsApiLoader } from "@react-google-maps/api";
import { Ref, useEffect, useImperativeHandle, useMemo, useRef } from "react";

import { useI18n } from "~/i18n/useI18n";
import { GetPublicLocationsQuery } from "~/types";
import { UUID } from "~/types/uuid";

import { COLOR_STYLES } from "./constants";
import { useDrawMarkers } from "./useDrawMarkers";
import { createDashedCirclePolyline } from "./utils";

export interface GoogleMapRef {
  getMap: () => google.maps.Map | null;
}
type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;
type GoogleMapInstance = google.maps.Map;

interface MapProps {
  colorScheme: "DARK" | "LIGHT";
  distance: number;
  locations: GetPublicLocationsQuery["locations"];
  onLoaded: () => void;
  onLocationSelected: (id: UUID) => void;
  ref: Ref<GoogleMapRef>;
  selectedLocationId: null | UUID;
  showMe?: boolean;
  userLocation: google.maps.LatLngLiteral | undefined;
}

type Polyline = google.maps.Polyline;

const MAP_STYLES = { height: "100%", width: "100%" };
const MAP_ZOOM = 14;

const libraries: Libraries = ["marker", "places"];

export const LocationsMap = ({
  colorScheme,
  distance,
  locations,
  onLoaded,
  onLocationSelected,
  ref,
  selectedLocationId,
  showMe,
  userLocation,
}: MapProps) => {
  const i18n = useI18n();

  const mapRef = useRef<GoogleMapInstance | null>(null);
  const dashedCircleRef = useRef<null | Polyline>(null);
  const markersRef = useRef<Map<UUID, AdvancedMarkerElement>>(new Map());
  const labelSpansRef = useRef<Map<UUID, HTMLSpanElement>>(new Map());

  const MAP_CONFIGS = useMemo(
    () => ({
      colorScheme,
      fullscreenControl: false,
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
      mapTypeControl: false,
      streetViewControl: false,
    }),
    [colorScheme],
  );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
  }));

  const onLoad = (map: GoogleMapInstance) => {
    mapRef.current = map;
  };

  useEffect(() => {
    if (isLoaded) {
      onLoaded();
    }
  }, [isLoaded, onLoaded]);

  useEffect(() => {
    if (!mapRef.current || !userLocation || !showMe) return;

    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: userLocation,
      zIndex: 10,
    });

    return () => {
      if (advancedMarker) {
        advancedMarker.map = null;
      }
    };
  }, [userLocation, showMe]);

  useEffect(() => {
    if (!isLoaded) return;

    const drawDashedCircle = () => {
      if (!mapRef.current || !userLocation || !distance) return;

      const map = mapRef.current;

      if (dashedCircleRef.current) {
        dashedCircleRef.current.setMap(null);
      }

      dashedCircleRef.current = createDashedCirclePolyline(
        map,
        userLocation,
        distance,
        COLOR_STYLES[colorScheme].bg,
      );
      if (dashedCircleRef.current) {
        const path = dashedCircleRef.current.getPath();
        const bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < path.getLength(); i++) {
          bounds.extend(path.getAt(i));
        }
        map.fitBounds(bounds, 50);
      }
    };

    setTimeout(drawDashedCircle, 500);
  }, [isLoaded, userLocation, distance, colorScheme]);

  useDrawMarkers({
    colorScheme,
    isLoaded,
    labelSpansRef,
    locations,
    mapRef,
    markersRef,
    onLocationSelected,
    selectedLocationId,
  });

  if (!isLoaded) {
    return (
      <div className="h-full w-full items-center justify-center">
        {i18n("Loading map...")}
      </div>
    );
  }

  return (
    <GoogleMap
      center={userLocation}
      key={colorScheme}
      mapContainerStyle={MAP_STYLES}
      onLoad={onLoad}
      options={MAP_CONFIGS}
      zoom={MAP_ZOOM}
    />
  );
};
