"use client";

import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";

type UnreadResponse = {
  latest: null | { conversation_id: string; sender_name: string; venue_slug: string };
  unreadCount: number;
};

const AUTO_DISMISS_MS = 8_000;

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const MessageToast = () => {
  const { isAuthenticated } = useUser();
  const i18n = useI18n();
  const locale = useLocale();
  const router = useRouter();
  const previousUnreadRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  const [message, setMessage] = useState<UnreadResponse["latest"]>(null);
  const [visible, setVisible] = useState(false); // drives enter/exit transform
  const [paused, setPaused] = useState(false); // hover pauses auto-dismiss + progress bar

  useEffect(() => {
    if (!isAuthenticated) return;
    let isCurrent = true;
    const load = async () => {
      const response = await fetch("/api/conversations/unread", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as UnreadResponse;
      if (!isCurrent) return;
      if (previousUnreadRef.current !== null && data.unreadCount > previousUnreadRef.current && data.latest) {
        setMessage(data.latest);
      }
      previousUnreadRef.current = data.unreadCount;
    };
    void load();
    const interval = window.setInterval(() => void load(), 15_000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Mount transition: flip to visible on the next frame so the initial
  // translate/opacity state actually renders before transitioning.
  useEffect(() => {
    if (!message) return;
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [message]);

  const handleClose = () => {
    setVisible(false);
    if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current);
    window.setTimeout(() => setMessage(null), 200); // matches exit transition duration
  };

  // Auto-dismiss, paused on hover.
  useEffect(() => {
    if (!message || paused) return;
    dismissTimerRef.current = window.setTimeout(handleClose, AUTO_DISMISS_MS);
    return () => {
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, paused]);

  if (!message) return null;

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className={`fixed top-20 right-4 z-50 w-80 transition-all duration-200 ease-out motion-reduce:transition-none ${
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="status"
    >
      <div className="bg-surface/95 group relative overflow-hidden rounded-2xl border border-neutral-200 shadow-lg shadow-neutral-900/5 backdrop-blur-sm transition-shadow duration-200 hover:shadow-xl">
        <button
          aria-label={i18n("Close")}
          className="absolute top-2 right-2 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          onClick={handleClose}
          type="button"
        >
          <X size={16} />
        </button>

        <button
          className="flex w-full items-start gap-3 p-4 pr-9 text-left"
          onClick={() => {
            router.push(`/${locale}/venues/${message.venue_slug}?conversation=${message.conversation_id}#Messaging`);
            handleClose();
          }}
          type="button"
        >
          <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {initialsFor(message.sender_name)}
          </span>

          <span className="min-w-0 pt-0.5">
            <span className="text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              {i18n("New message")}
            </span>
            <span className="mt-1 block truncate text-sm font-medium text-neutral-900">
              {i18n("{name} sent you a message", { name: message.sender_name })}
            </span>
          </span>
        </button>

        <div className="h-0.5 w-full bg-neutral-100">
          <div
            className={`bg-primary/40 h-full ${paused ? "" : "transition-[width] ease-linear"}`}
            style={{
              transitionDuration: paused ? "0ms" : `${AUTO_DISMISS_MS}ms`,
              width: visible && !paused ? "0%" : "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};
