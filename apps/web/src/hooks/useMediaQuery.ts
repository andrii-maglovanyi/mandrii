"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/** Keep the first client render identical to SSR, then subscribe to the viewport. */
export function useMediaQuery({ defaultMatches = false, query }: { defaultMatches?: boolean; query: string }) {
  const media = useMemo(
    () => (typeof window === "undefined" || !window.matchMedia ? null : window.matchMedia(query)),
    [query],
  );
  const subscribe = useCallback(
    (callback: () => void) => {
      media?.addEventListener("change", callback);
      return () => media?.removeEventListener("change", callback);
    },
    [media],
  );
  return useSyncExternalStore(
    subscribe,
    () => media?.matches ?? defaultMatches,
    () => defaultMatches,
  );
}
