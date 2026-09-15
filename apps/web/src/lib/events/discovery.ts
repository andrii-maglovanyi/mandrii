import type { GetPublicEventsQuery } from "~/types";

import { doesEventOccurInRange, sortEventsByNextOccurrence } from "./recurrence";

export type EventSchedule = Pick<GetPublicEventsQuery["events"][number], "end_date" | "id" | "is_recurring" | "recurrence_rule" | "start_date">;
export type EventWindow = { from?: string; includePast?: boolean; to?: string; };

export function orderEventsByIds<T extends { id: string }>(events: T[], ids: string[]) {
  const byId = new Map(events.map((event) => [event.id, event]));
  return ids.flatMap((id) => {
    const event = byId.get(id);
    return event ? [event] : [];
  });
}

/** Shared exact filtering for client catalogues and server-rendered previews. */
export function selectEventSchedules<T extends EventSchedule>(schedules: T[], window: EventWindow, now: Date) {
  const from = window.from ?? (window.includePast ? undefined : now.toISOString());
  const to = window.to && (/^\d{4}-\d{2}-\d{2}$/.test(window.to) ? `${window.to}T23:59:59.999Z` : window.to);
  const matching = from || to ? schedules.filter((event) => doesEventOccurInRange(event, { from, to })) : schedules;
  return sortEventsByNextOccurrence(matching, from ? new Date(from) : now);
}
