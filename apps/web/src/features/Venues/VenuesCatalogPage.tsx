"use client";

import { MixpanelTracker } from "~/components/layout";
import { FollowAreaButton } from "~/features/Following/FollowAreaButton";
import { AddEntityButton, useAddEntity } from "~/features/shared/AddEntityButton";
import { CatalogPageHeader } from "~/features/shared/Catalog/CatalogPageHeader";
import { useI18n } from "~/i18n/useI18n";

import { VenuesCatalog } from "./Catalog/VenuesCatalog";

export function VenuesCatalogPage() {
  const i18n = useI18n();
  const { handleAdd: handleAddVenue, isAuthenticated } = useAddEntity({
    mixpanelEvent: "Clicked Add Venue",
    mixpanelSource: "venues_page",
    route: "/user-directory/venues",
  });

  return (
    <div className="container mx-auto">
      <CatalogPageHeader
        addAction={
          <AddEntityButton
            isAuthenticated={isAuthenticated}
            label={i18n("Add venue")}
            onClick={handleAddVenue}
            signInLabel={i18n("Sign in to add venue")}
          />
        }
        description={i18n("Explore Ukrainian venues and community spaces around the world")}
        followAction={<FollowAreaButton size="md" />}
        homeLabel={i18n("Home")}
        mapHref="/map#venues"
        mapLabel={i18n("View venues on map")}
        title={i18n("Discover venues")}
      />

      <VenuesCatalog />
      <MixpanelTracker event="Viewed Venues Catalog Page" />
    </div>
  );
}
