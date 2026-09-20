"use client";

import { MixpanelTracker } from "~/components/layout";
import { FollowAreaButton } from "~/features/Following/FollowAreaButton";
import { AddEntityButton, useAddEntity } from "~/features/shared/AddEntityButton";
import { useI18n } from "~/i18n/useI18n";

import { VenuesCatalog } from "./Catalog/VenuesCatalog";
import { PublicPageHeader } from "~/components/layout/PublicPageHeader/PublicPageHeader";
import { TextLink, Tooltip } from "~/components/ui";
import { Map } from "lucide-react";

export function VenuesCatalogPage() {
  const i18n = useI18n();
  const { handleAdd: handleAddVenue, isAuthenticated } = useAddEntity({
    mixpanelEvent: "Clicked Add Venue",
    mixpanelSource: "venues_page",
    route: "/user-directory/venues",
  });

  return (
    <div className="container mx-auto">
      <PublicPageHeader
        breadcrumbs={[{ title: i18n("Home"), url: "/" }]}
        title={i18n("Discover venues")}
        description={i18n("Find places and spaces that bring people together")}
        actionButtons={
          <>
            <div className="flex w-full gap-4 sm:w-auto">
              <div className="flex grow flex-col items-center justify-center sm:flex-row">
                <Tooltip label={i18n("View venues on map")}>
                  <TextLink href="/map#venues">
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
              label={i18n("Add venue")}
              onClick={handleAddVenue}
              signInLabel={i18n("Sign in to add venue")}
            />
          </>
        }
      />

      <VenuesCatalog />
      <MixpanelTracker event="Viewed Venues Catalog Page" />
    </div>
  );
}
