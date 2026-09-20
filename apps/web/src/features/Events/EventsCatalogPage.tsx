"use client";

import { MixpanelTracker } from "~/components/layout";
import { FollowAreaButton } from "~/features/Following/FollowAreaButton";
import { AddEntityButton, useAddEntity } from "~/features/shared/AddEntityButton";
import { useI18n } from "~/i18n/useI18n";

import { EventsCatalog } from "./Catalog/EventsCatalog";
import { PublicPageHeader } from "~/components/layout/PublicPageHeader/PublicPageHeader";
import { TextLink, Tooltip } from "~/components/ui";
import { Map } from "lucide-react";

export function EventsCatalogPage() {
  const i18n = useI18n();
  const { handleAdd: handleAddEvent, isAuthenticated } = useAddEntity({
    mixpanelEvent: "Clicked Add Event",
    mixpanelSource: "events_page",
    route: "/user-directory/events",
  });

  return (
    <div className="container mx-auto">
      <PublicPageHeader
        breadcrumbs={[{ title: i18n("Home"), url: "/" }]}
        title={i18n("Explore events")}
        description={i18n("See what's happening near you")}
        actionButtons={
          <>
            <div className="flex w-full gap-4 sm:w-auto">
              <div className="flex grow flex-col items-center justify-center sm:flex-row">
                <Tooltip label={i18n("View events on map")}>
                  <TextLink href="/map#events">
                    <Map /> {i18n("View on map")}
                  </TextLink>
                </Tooltip>
              </div>

              <div className="flex grow flex-col justify-center sm:flex-row">
                <FollowAreaButton />
              </div>
            </div>
            <AddEntityButton
              isAuthenticated={isAuthenticated}
              label={i18n("Add event")}
              onClick={handleAddEvent}
              signInLabel={i18n("Sign in to add event")}
            />
          </>
        }
      />

      <EventsCatalog />
      <MixpanelTracker event="Viewed Events Catalog Page" />
    </div>
  );
}
