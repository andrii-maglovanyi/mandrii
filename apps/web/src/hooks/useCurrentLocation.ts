"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useI18n } from "~/i18n/useI18n";

import { useNotifications } from "./useNotifications";

/** One user-triggered location request, with a battery-conscious cached fix. */
export function useCurrentLocation() {
  const i18n = useI18n();
  const { showError } = useNotifications();
  const [locating, setLocating] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const locate = useCallback(
    (onLocated: (location: { lat: number; lng: number }) => void) => {
      if (pending.current) return;
      if (!navigator.geolocation) {
        showError(i18n("Unable to find your location. Please try searching!"));
        return;
      }
      pending.current = true;
      setLocating(true);
      const finish = () => {
        pending.current = false;
        if (mounted.current) setLocating(false);
      };
      navigator.geolocation.getCurrentPosition(
        (position) => {
          finish();
          if (mounted.current) onLocated({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          finish();
          if (mounted.current)
            showError(
              i18n(
                error.code === 1
                  ? "Location access denied. Please enable it in your browser settings."
                  : "Unable to find your location. Please try searching!",
              ),
            );
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
      );
    },
    [i18n, showError],
  );
  return { locate, locating };
}
