"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMessagingUnreadEventsSubscription } from "~/types/graphql.generated";

export const MESSAGING_UNREAD_UPDATED_EVENT = "messaging-unread-updated";

export type UnreadMessagingUpdate = {
  latest: null | {
    body: string;
    conversation_id: string;
    recipient_role: "OWNER" | "USER";
    sender_name: string;
    venue_slug: string;
  };
  unreadCount: number;
};

export const useUnreadMessages = (enabled = true) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const isActiveRef = useRef(false);
  const previousUnreadCountRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const refreshTimerRef = useRef<number | null>(null);
  const subscriptionReadyRef = useRef(false);
  const loadUnreadCount = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const response = await fetch("/api/conversations/unread", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as UnreadMessagingUpdate;
      if (isActiveRef.current && requestId === requestIdRef.current) {
        if (
          previousUnreadCountRef.current !== null &&
          data.unreadCount > previousUnreadCountRef.current &&
          data.latest
        ) {
          window.dispatchEvent(
            new CustomEvent<UnreadMessagingUpdate>(MESSAGING_UNREAD_UPDATED_EVENT, { detail: data }),
          );
        }
        previousUnreadCountRef.current = data.unreadCount;
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // The counter is supplementary; a transient request failure should remain invisible.
    }
  }, []);
  const scheduleUnreadRefresh = useCallback(
    (delay = 250) => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        void loadUnreadCount();
      }, delay);
    },
    [loadUnreadCount],
  );
  const { data: unreadEvents } = useMessagingUnreadEventsSubscription({
    skip: !enabled,
  });

  useEffect(() => {
    if (!enabled) {
      isActiveRef.current = false;
      requestIdRef.current++;
      previousUnreadCountRef.current = null;
      subscriptionReadyRef.current = false;
      setUnreadCount(0);
      return;
    }

    isActiveRef.current = true;
    previousUnreadCountRef.current = null;
    subscriptionReadyRef.current = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!subscriptionReadyRef.current) scheduleUnreadRefresh(0);
    }, 1_500);
    window.addEventListener("messages-read", loadUnreadCount);
    return () => {
      isActiveRef.current = false;
      requestIdRef.current++;
      previousUnreadCountRef.current = null;
      subscriptionReadyRef.current = false;
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("messages-read", loadUnreadCount);
    };
  }, [enabled, loadUnreadCount, scheduleUnreadRefresh]);

  useEffect(() => {
    if (!enabled || !unreadEvents) return;
    subscriptionReadyRef.current = true;
    scheduleUnreadRefresh();
  }, [enabled, scheduleUnreadRefresh, unreadEvents]);

  return unreadCount;
};
