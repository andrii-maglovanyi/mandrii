import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { EditEvent } from "~/features";
import { useI18n } from "~/i18n/useI18n";

const NewEventPageLayout = () => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Events"), url: `/user-directory#Events` }]} />
      <h1 className={`text-on-surface mb-12 text-3xl font-extrabold md:text-5xl`}>{i18n("Add new event")}</h1>

      <EditEvent />
    </>
  );
};

export default async function NewEventPage() {
  return (
    <>
      <NewEventPageLayout />
      <MixpanelTracker event="Viewed New Event Page" />
    </>
  );
}
