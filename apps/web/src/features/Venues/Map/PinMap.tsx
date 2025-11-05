import { GoogleMap, Libraries, useJsApiLoader } from "@react-google-maps/api";
import { Ref, useEffect, useImperativeHandle, useMemo, useRef } from "react";

import { useI18n } from "~/i18n/useI18n";
import { publicConfig } from "~/lib/config/public";
import { GetPublicVenuesQuery } from "~/types";
import { UUID } from "~/types/uuid";

import { COLOR_STYLES } from "../constants";
import { createDashedCirclePolyline } from "../utils";
import { useDrawMarkers } from "./useDrawMarkers";

export interface GoogleMapRef {
  getMap: () => google.maps.Map | null;
}
type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;
type GoogleMapInstance = google.maps.Map;

interface PinMapProps {
  colorScheme: "DARK" | "LIGHT";
  distance: number;
  drawRadius?: boolean;
  onLoaded?: () => void;
  onVenueSelected?: (id: UUID) => void;
  ref?: Ref<GoogleMapRef>;
  selectedVenueId?: null | UUID;
  showMe?: boolean;
  userLocation?: google.maps.LatLngLiteral;
  venues?: GetPublicVenuesQuery["venues"];
  zoom?: number;
}

type Polyline = google.maps.Polyline;

const MAP_STYLES = { height: "100%", width: "100%" };

const libraries: Libraries = ["marker", "places"];

export const PinMap = ({
  colorScheme,
  distance,
  drawRadius,
  onLoaded,
  onVenueSelected,
  ref,
  selectedVenueId,
  showMe,
  userLocation,
  venues,
  zoom = 18,
}: PinMapProps) => {
  const i18n = useI18n();

  const mapRef = useRef<GoogleMapInstance | null>(null);
  const dashedCircleRef = useRef<null | Polyline>(null);
  const markersRef = useRef<Map<UUID, AdvancedMarkerElement>>(new Map());
  const labelSpansRef = useRef<Map<UUID, HTMLSpanElement>>(new Map());

  const MAP_CONFIGS = useMemo(
    () => ({
      colorScheme,
      fullscreenControl: false,
      mapId: publicConfig.maps.mapId,
      mapTypeControl: false,
      streetViewControl: false,
    }),
    [colorScheme],
  );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: publicConfig.maps.apiKey,
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
      onLoaded?.();
    }
  }, [isLoaded, onLoaded]);

  useEffect(() => {
    if (!userLocation || !showMe || !isLoaded) return;

    let advancedMarker: google.maps.marker.AdvancedMarkerElement | null = null;

    const timeout = setTimeout(() => {
      advancedMarker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: userLocation,
        zIndex: 10,
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (advancedMarker) {
        advancedMarker.map = null;
        advancedMarker = null;
      }
    };
  }, [userLocation, showMe, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const drawDashedCircle = () => {
      if (!mapRef.current || !userLocation || !distance) return;

      const map = mapRef.current;

      if (dashedCircleRef.current) {
        dashedCircleRef.current.setMap(null);
      }

      dashedCircleRef.current = createDashedCirclePolyline(map, userLocation, distance, COLOR_STYLES[colorScheme].bg);
      if (dashedCircleRef.current) {
        const path = dashedCircleRef.current.getPath();
        const bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < path.getLength(); i++) {
          bounds.extend(path.getAt(i));
        }
        map.fitBounds(bounds, 50);
      }
    };

    if (drawRadius) {
      setTimeout(drawDashedCircle, 500);
    }
  }, [isLoaded, userLocation, distance, colorScheme, drawRadius]);

  useDrawMarkers({
    colorScheme,
    isLoaded,
    labelSpansRef,
    mapRef,
    markersRef,
    onVenueSelected,
    selectedVenueId,
    venues,
  });

  if (!isLoaded) {
    return <div className="h-full w-full items-center justify-center">{i18n("Loading map...")}</div>;
  }

  return (
    <GoogleMap
      center={userLocation}
      key={colorScheme}
      mapContainerStyle={MAP_STYLES}
      onLoad={onLoad}
      options={MAP_CONFIGS}
      zoom={zoom}
    />
  );
};
