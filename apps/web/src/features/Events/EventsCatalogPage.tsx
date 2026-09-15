"use client";

import { MixpanelTracker } from "~/components/layout";
import { FollowAreaButton } from "~/features/Following/FollowAreaButton";
import { AddEntityButton, useAddEntity } from "~/features/shared/AddEntityButton";
import { CatalogPageHeader } from "~/features/shared/Catalog/CatalogPageHeader";
import { useI18n } from "~/i18n/useI18n";

import { EventsCatalog } from "./Catalog/EventsCatalog";

export function EventsCatalogPage() {
  const i18n = useI18n();
  const { handleAdd: handleAddEvent, isAuthenticated } = useAddEntity({
    mixpanelEvent: "Clicked Add Event",
    mixpanelSource: "events_page",
    route: "/user-directory/events",
  });

  return (
    <div className="container mx-auto">
      <CatalogPageHeader
        addAction={
          <AddEntityButton
            isAuthenticated={isAuthenticated}
            label={i18n("Add event")}
            onClick={handleAddEvent}
            signInLabel={i18n("Sign in to add event")}
          />
        }
        description={i18n("Explore Ukrainian events and gatherings around the world")}
        followAction={<FollowAreaButton size="md" />}
        homeLabel={i18n("Home")}
        mapHref="/map#events"
        mapLabel={i18n("View events on map")}
        title={i18n("Explore events")}
      />

      <EventsCatalog />
      <MixpanelTracker event="Viewed Events Catalog Page" />
    </div>
  );
}
