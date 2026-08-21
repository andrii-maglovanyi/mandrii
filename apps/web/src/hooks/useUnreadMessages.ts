"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMessagingUnreadEventsSubscription } from "~/types/graphql.generated";

export const useUnreadMessages = (enabled = true) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const isActiveRef = useRef(false);
  const requestIdRef = useRef(0);
  const loadUnreadCount = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const response = await fetch("/api/conversations/unread", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { unreadCount: number };
      if (isActiveRef.current && requestId === requestIdRef.current) {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // The counter is supplementary; a transient request failure should remain invisible.
    }
  }, []);
  const { data: unreadEvents } = useMessagingUnreadEventsSubscription({
    skip: !enabled,
  });

  useEffect(() => {
    if (!enabled) {
      isActiveRef.current = false;
      requestIdRef.current++;
      setUnreadCount(0);
      return;
    }

    isActiveRef.current = true;
    void loadUnreadCount();
    window.addEventListener("messages-read", loadUnreadCount);
    return () => {
      isActiveRef.current = false;
      requestIdRef.current++;
      window.removeEventListener("messages-read", loadUnreadCount);
    };
  }, [enabled, loadUnreadCount]);

  useEffect(() => {
    if (unreadEvents) void loadUnreadCount();
  }, [loadUnreadCount, unreadEvents]);

  return unreadCount;
};
