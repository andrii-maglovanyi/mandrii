"use client";

import { useCallback, useEffect, useState } from "react";

import {
  clearDiscoveryLocation,
  DISCOVERY_LOCATION_CHANGE_EVENT,
  DiscoveryLocation,
  EMPTY_DISCOVERY_LOCATION,
  getStoredDiscoveryLocation,
  saveDiscoveryLocation,
} from "./discoveryLocation";

export const useDiscoveryLocation = () => {
  const [location, setLocation] = useState<DiscoveryLocation>(EMPTY_DISCOVERY_LOCATION);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setLocation(getStoredDiscoveryLocation());
    setIsReady(true);

    const handleLocationChange = (event: Event) => {
      const nextLocation = (event as CustomEvent<DiscoveryLocation>).detail;
      setLocation(nextLocation ?? EMPTY_DISCOVERY_LOCATION);
    };

    window.addEventListener(DISCOVERY_LOCATION_CHANGE_EVENT, handleLocationChange);
    return () => window.removeEventListener(DISCOVERY_LOCATION_CHANGE_EVENT, handleLocationChange);
  }, []);

  const saveLocation = useCallback((nextLocation: DiscoveryLocation) => {
    const savedLocation = saveDiscoveryLocation(nextLocation);
    setLocation(savedLocation);
    return savedLocation;
  }, []);

  const clearLocation = useCallback(() => {
    const clearedLocation = clearDiscoveryLocation();
    setLocation(clearedLocation);
    return clearedLocation;
  }, []);

  return { clearLocation, isReady, location, saveLocation };
};
