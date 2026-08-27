"use client";

import { useCallback, useEffect, useState } from "react";

import { MESSAGING_UNREAD_UPDATED_EVENT } from "~/hooks/useUnreadMessages";

export const useVenueUnreadCount = (venueId: string | undefined, enabled: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!venueId) return;

    try {
      const response = await fetch(`/api/conversations?venueId=${venueId}&summary=unread`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { unreadCount?: number };
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // This badge is supplementary. The chat itself remains the source of truth.
    }
  }, [venueId]);

  useEffect(() => {
    if (!enabled || !venueId) {
      setUnreadCount(0);
      return;
    }

    void refresh();
    window.addEventListener(MESSAGING_UNREAD_UPDATED_EVENT, refresh);
    window.addEventListener("messages-read", refresh);
    return () => {
      window.removeEventListener(MESSAGING_UNREAD_UPDATED_EVENT, refresh);
      window.removeEventListener("messages-read", refresh);
    };
  }, [enabled, refresh, venueId]);

  return unreadCount;
};
