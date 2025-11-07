import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { EditVenue } from "~/features";
import { useI18n } from "~/i18n/useI18n";

const VenuePageLayout = () => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Venues"), url: `/user-directory#Venues` }]} />
      <h1 className={`text-on-surface mb-12 text-3xl font-extrabold md:text-5xl`}>{i18n("Add venue")}</h1>

      <EditVenue />
    </>
  );
};

export default async function VenuePage() {
  return (
    <>
      <VenuePageLayout />
      <MixpanelTracker event="Viewed Add Venue Page" />
    </>
  );
}
