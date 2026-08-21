"use client";

import { useEffect, useState } from "react";

export const useUnreadMessages = (enabled = true) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }

    let isCurrent = true;
    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/conversations/unread", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { unreadCount: number };
        if (isCurrent) setUnreadCount(data.unreadCount);
      } catch {
        // The counter is supplementary; a transient request failure should remain invisible.
      }
    };

    void loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 15_000);
    window.addEventListener("messages-read", loadUnreadCount);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
      window.removeEventListener("messages-read", loadUnreadCount);
    };
  }, [enabled]);

  return unreadCount;
};
