"use client";

import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { EventsCatalog } from "~/features/Events";
import { AddEntityButton, useAddEntity } from "~/features/shared/AddEntityButton";
import { useI18n } from "~/i18n/useI18n";

export default function EventsPage() {
  const i18n = useI18n();

  const { handleAdd: handleAddEvent, isAuthenticated } = useAddEntity({
    mixpanelEvent: "Clicked Add Event",
    mixpanelSource: "events_page",
    route: "/user-directory/events",
  });

  return (
    <div className="container mx-auto">
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/` }]} />
      <div className={`mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}>
        <h1
          className={`from-primary to-secondary bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl`}
        >
          {i18n("Explore events")}
        </h1>
        <AddEntityButton
          className="ml-auto"
          isAuthenticated={isAuthenticated}
          label={i18n("Add event")}
          onClick={handleAddEvent}
          signInLabel={i18n("Sign in to add event")}
        />
      </div>

      <div className="container mx-auto">
        <p className="text-neutral">{i18n("Explore Ukrainian events and gatherings around the world")}</p>

        <EventsCatalog />
        <MixpanelTracker event="Viewed Events Catalog Page" />
      </div>
    </div>
  );
}
