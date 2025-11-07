"use client";

import Link from "next/link";

import { Button } from "~/components/ui";
import { useEvents } from "~/hooks/useEvents";
import { useI18n } from "~/i18n/useI18n";

import { EventsMasonryCard } from "./EventCard/EventsMasonryCard";

export const EventsBanner = () => {
  const i18n = useI18n();
  const { usePublicEvents } = useEvents();

  const { data: events, loading } = usePublicEvents({
    limit: 3,
    order_by: [{ created_at: "desc" }],
    where: {},
  });

  if (loading || !events?.length) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{i18n("Upcoming events")}</h2>
        <Link href="/events">
          <Button color="primary" size="sm" variant="ghost">
            {i18n("View all")}
          </Button>
        </Link>
      </div>

      <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`}>
        {events.map((event, index) => (
          <EventsMasonryCard event={event} key={event.id} layoutSize={index === 0 ? "full" : "small"} />
        ))}
      </div>
    </div>
  );
};
