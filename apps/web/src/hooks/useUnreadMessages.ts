"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMessagingUnreadEventsSubscription } from "~/types/graphql.generated";

export const MESSAGING_UNREAD_UPDATED_EVENT = "messaging-unread-updated";

export type UnreadMessagingUpdate = {
  latest: {
    body: string;
    conversation_id: string;
    recipient_role: "OWNER" | "USER";
    sender_name: string;
    venue_slug: string;
  } | null;
  unreadCount: number;
};

const unreadRequests = new Map<string, Promise<null | UnreadMessagingUpdate>>();

const fetchUnreadMessages = (userId: string) => {
  const existing = unreadRequests.get(userId);
  if (existing) return existing;

  const request = fetch("/api/conversations/unread", { cache: "no-store" })
    .then(async (response) => (response.ok ? ((await response.json()) as UnreadMessagingUpdate) : null))
    .catch(() => null)
    .finally(() => {
      unreadRequests.delete(userId);
    });
  unreadRequests.set(userId, request);
  return request;
};

export const useUnreadMessages = (enabled = true) => {
  const { data: session, status } = useSession();
  const userId = status === "authenticated" && enabled ? session?.user?.id : undefined;
  const [count, setCount] = useState<{ userId: string; value: number } | null>(null);
  const isActiveRef = useRef(false);
  const previousUnreadCountRef = useRef<null | number>(null);
  const requestIdRef = useRef(0);
  const refreshTimerRef = useRef<null | number>(null);
  const subscriptionReadyRef = useRef(false);
  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;
    const requestId = ++requestIdRef.current;
    try {
      const data = await fetchUnreadMessages(userId);
      if (!data) return;
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
        setCount({ userId, value: data.unreadCount });
      }
    } catch {
      /* The counter is supplementary; a transient request failure should remain invisible. */
    }
  }, [userId]);
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
    skip: !userId,
  });

  useEffect(() => {
    if (!userId) {
      isActiveRef.current = false;
      requestIdRef.current++;
      previousUnreadCountRef.current = null;
      subscriptionReadyRef.current = false;
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
  }, [userId, loadUnreadCount, scheduleUnreadRefresh]);

  useEffect(() => {
    if (!userId || !unreadEvents) return;
    subscriptionReadyRef.current = true;
    scheduleUnreadRefresh();
  }, [userId, scheduleUnreadRefresh, unreadEvents]);

  return count?.userId === userId ? (count?.value ?? 0) : 0;
};
