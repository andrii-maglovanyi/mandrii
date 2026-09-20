"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { AnimatedEllipsis } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

import { EventsMap } from "../Events/Map/EventsMap";
import { VenuesMap } from "../Venues/Map/VenuesMap";

type ViewMode = "events" | "venues";

const VIEWS = ["events", "venues"] as const;

export const MapView = () => {
  const i18n = useI18n();
  const [viewMode, setViewMode] = useState<null | ViewMode>(null);

  useEffect(() => {
    const syncView = () => {
      let hashView = "";
      try {
        hashView = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        /* Invalid hashes use the default view. */
      }
      setViewMode(VIEWS.includes(hashView as ViewMode) ? (hashView as ViewMode) : "venues");
    };
    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  return (
    <div className={`
      flex h-[calc(100vh-64px)] grow flex-col overflow-hidden bg-neutral/10
    `}>
      <div className="border-b border-primary/10">
        <div className="mx-auto flex max-w-(--breakpoint-xl) gap-1 px-2 pt-2">
          <button
            aria-label={i18n("Venues")}
            aria-pressed={viewMode === "venues"}
            className={`
              relative -mb-px flex flex-1 cursor-pointer items-center
              justify-center gap-2 rounded-t-lg border-x border-t px-6 py-3
              font-medium transition-all duration-200
              ${
              viewMode === "venues"
                ? `
                  border-primary/20 bg-surface text-on-surface
                  shadow-[0_-2px_8px_rgba(0,0,0,0.1)]
                `
                : `
                  border-transparent text-neutral-disabled
                  hover:text-neutral
                `
            }
            `}
            onClick={() => {
              setViewMode("venues");
              window.location.hash = "venues";
            }}
            type="button"
          >
            <MapPin size={20} />
            <span className={`
              hidden
              sm:inline
            `}>{i18n("Venues")}</span>
          </button>
          <button
            aria-label={i18n("Events")}
            aria-pressed={viewMode === "events"}
            className={`
              relative -mb-px flex flex-1 cursor-pointer items-center
              justify-center gap-2 rounded-t-lg border-x border-t px-6 py-3
              font-medium transition-all duration-200
              ${
              viewMode === "events"
                ? `
                  border-primary/20 bg-surface text-on-surface
                  shadow-[0_-2px_8px_rgba(0,0,0,0.1)]
                `
                : `
                  border-transparent text-neutral-disabled
                  hover:text-neutral
                `
            }
            `}
            onClick={() => {
              setViewMode("events");
              window.location.hash = "events";
            }}
            type="button"
          >
            <CalendarDays size={20} />
            <span className={`
              hidden
              sm:inline
            `}>{i18n("Events")}</span>
          </button>
        </div>
      </div>

      {viewMode === null ? (
        <div className="flex grow items-center justify-center">
          <AnimatedEllipsis size="md" />
        </div>
      ) : viewMode === "venues" ? (
        <VenuesMap />
      ) : (
        <EventsMap />
      )}
    </div>
  );
};
