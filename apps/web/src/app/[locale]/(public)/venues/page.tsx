"use client";

import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { VenuesCatalog } from "~/features/Venues";
import { AddEntityButton, useAddEntity } from "~/features/shared/AddEntityButton";
import { useI18n } from "~/i18n/useI18n";

export default function VenuesPage() {
  const i18n = useI18n();

  const { handleAdd: handleAddVenue, isAuthenticated } = useAddEntity({
    mixpanelEvent: "Clicked Add Venue",
    mixpanelSource: "venues_page",
    route: "/user-directory/venues",
  });

  return (
    <div className="container mx-auto">
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/` }]} />
      <div className={`mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}>
        <h1
          className={`from-primary to-secondary bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl`}
        >
          {i18n("Discover venues")}
        </h1>
        <AddEntityButton
          className="ml-auto"
          isAuthenticated={isAuthenticated}
          label={i18n("Add venue")}
          onClick={handleAddVenue}
          signInLabel={i18n("Sign in to add venue")}
        />
      </div>

      <div className="container mx-auto">
        <p className="text-neutral">{i18n("Explore Ukrainian venues and community spaces around the world")}</p>

        <VenuesCatalog />
        <MixpanelTracker event="Viewed Venues Catalog Page" />
      </div>
    </div>
  );
}
