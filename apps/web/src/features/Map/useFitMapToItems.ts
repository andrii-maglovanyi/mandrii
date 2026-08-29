import { RefObject, useEffect } from "react";

type Coordinates = readonly [number, number];

interface UseFitMapToItemsOptions<T> {
  enabled: boolean;
  getCoordinates: (item: T) => Coordinates | undefined;
  isLoaded: boolean;
  isMapReady: boolean;
  items?: T[];
  mapRef: RefObject<google.maps.Map | null>;
}

export const useFitMapToItems = <T>({
  enabled,
  getCoordinates,
  isLoaded,
  isMapReady,
  items,
  mapRef,
}: UseFitMapToItemsOptions<T>) => {
  useEffect(() => {
    if (!enabled || !isLoaded || !isMapReady || !mapRef.current || !items?.length) return;

    const bounds = new google.maps.LatLngBounds();
    let hasCoordinates = false;

    for (const item of items) {
      const coordinates = getCoordinates(item);
      if (!coordinates) continue;

      bounds.extend({ lat: coordinates[1], lng: coordinates[0] });
      hasCoordinates = true;
    }

    if (hasCoordinates) {
      mapRef.current.fitBounds(bounds, 50);
    }
  }, [enabled, getCoordinates, isLoaded, isMapReady, items, mapRef]);
};
