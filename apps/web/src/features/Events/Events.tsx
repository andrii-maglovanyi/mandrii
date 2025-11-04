"use client";

import { Calendar, MapPinOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { Button, EmptyState, ProgressBar, Select } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { Event_Type_Enum, Price_Type_Enum } from "~/lib/validation/event";
import { useEvents, getEventsFilter } from "~/hooks/useEvents";
import { useListControls } from "~/hooks/useListControls";

const EVENT_TYPES = [
  { label: "All types", value: "" },
  { label: "Celebration", value: Event_Type_Enum.CELEBRATION },
  { label: "Charity", value: Event_Type_Enum.CHARITY },
  { label: "Concert", value: Event_Type_Enum.CONCERT },
  { label: "Conference", value: Event_Type_Enum.CONFERENCE },
  { label: "Exhibition", value: Event_Type_Enum.EXHIBITION },
  { label: "Festival", value: Event_Type_Enum.FESTIVAL },
  { label: "Gathering", value: Event_Type_Enum.GATHERING },
  { label: "Screening", value: Event_Type_Enum.SCREENING },
  { label: "Sports", value: Event_Type_Enum.SPORTS },
  { label: "Theater", value: Event_Type_Enum.THEATER },
  { label: "Workshop", value: Event_Type_Enum.WORKSHOP },
  { label: "Other", value: Event_Type_Enum.OTHER },
];

const PRICE_TYPES = [
  { label: "All prices", value: "" },
  { label: "Free", value: Price_Type_Enum.FREE },
  { label: "Paid", value: Price_Type_Enum.PAID },
  { label: "Donation", value: Price_Type_Enum.DONATION },
  { label: "Suggested donation", value: Price_Type_Enum.SUGGESTED_DONATION },
];

const EVENT_LOCATION_TYPES = [
  { label: "All events", value: "" },
  { label: "In-person", value: "in-person" },
  { label: "Online", value: "online" },
];

export const Events = () => {
  const i18n = useI18n();

  const [eventType, setEventType] = useState<string>("");
  const [priceType, setPriceType] = useState<string>("");
  const [locationType, setLocationType] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  const { variables } = getEventsFilter({
    eventType: eventType as Event_Type_Enum | undefined,
    isOnline: locationType === "online" ? true : locationType === "in-person" ? false : undefined,
    priceType: priceType as Price_Type_Enum | undefined,
  });

  const { handleFilter, listState } = useListControls({
    limit: 50,
    where: variables.where,
  });

  const { usePublicEvents } = useEvents();

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const { count, data, loading, total } = usePublicEvents(listState);

  useEffect(() => {
    const { variables } = getEventsFilter({
      eventType: eventType as Event_Type_Enum | undefined,
      isOnline: locationType === "online" ? true : locationType === "in-person" ? false : undefined,
      priceType: priceType as Price_Type_Enum | undefined,
    });

    handleFilter(variables.where);
  }, [eventType, priceType, locationType, handleFilter]);

  useEffect(() => {
    // Simulate map loading
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const eventTypeOptions = useMemo(
    () =>
      EVENT_TYPES.map(({ label, value }) => ({
        label: i18n(label),
        value,
      })),
    [i18n],
  );

  const priceTypeOptions = useMemo(
    () =>
      PRICE_TYPES.map(({ label, value }) => ({
        label: i18n(label),
        value,
      })),
    [i18n],
  );

  const locationTypeOptions = useMemo(
    () =>
      EVENT_LOCATION_TYPES.map(({ label, value }) => ({
        label: i18n(label),
        value,
      })),
    [i18n],
  );

  return (
    <div className="flex h-full grow flex-col">
      <div className="flex grow flex-row">
        <div className="flex grow flex-col">
          <div className="mx-auto mt-4 w-full max-w-(--breakpoint-xl) p-4">
            <div className="shrink-0 space-y-4">
              <h1 className="mb-6 text-3xl font-extrabold md:text-5xl">{i18n("Events")}</h1>

              <div className="flex flex-col gap-x-2 md:flex-row">
                <div className="mb-4 flex-1 md:mb-0">
                  <Select
                    disabled={!isReady}
                    onChange={(e) => setEventType(e.target.value)}
                    options={eventTypeOptions}
                    placeholder={i18n("Select type...")}
                    value={eventType}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      disabled={!isReady}
                      onChange={(e) => setPriceType(e.target.value)}
                      options={priceTypeOptions}
                      value={priceType}
                    />
                  </div>
                  <div className="flex-1">
                    <Select
                      disabled={!isReady}
                      onChange={(e) => setLocationType(e.target.value)}
                      options={locationTypeOptions}
                      value={locationType}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between">
                <div className="text-sm sm:text-base">
                  {isReady && (
                    <p>
                      {i18n("Showing **{count}** of **{total}**", { count, total })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isReady ? (
            <div className="mx-auto flex h-full w-1/2 flex-col justify-center">
              <ProgressBar isLoading={!isReady} onLoaded={() => setIsReady(true)} />
            </div>
          ) : !(data?.length || loading) ? (
            <div className="flex h-full w-full items-center justify-center">
              <EmptyState
                body={i18n("Try adjusting your filters")}
                heading={i18n("No events found")}
                icon={<Calendar size={50} />}
              />
            </div>
          ) : (
            <div className="mx-auto w-full max-w-(--breakpoint-xl) p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.map((event: Record<string, unknown>) => (
                  <div
                    key={String(event.id)}
                    className="rounded-lg border border-neutral/20 bg-surface p-4"
                  >
                    <h3 className="mb-2 text-lg font-bold">{String(event.title)}</h3>
                    <p className="text-sm text-neutral">
                      {new Date(String(event.start_date)).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
