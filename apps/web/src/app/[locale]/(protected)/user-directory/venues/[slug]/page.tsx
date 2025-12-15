import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { EditVenue } from "~/features";
import { useI18n } from "~/i18n/useI18n";

interface EditVenuePageLayoutProps {
  slug: string;
}

interface EditVenuePageProps {
  params: Readonly<Promise<{ slug: string }>>;
}

const VenuePageLayout = ({ slug }: EditVenuePageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Venues"), url: `/user-directory#Venues` }]} />
      <h1 className={`text-on-surface mb-12 text-3xl font-extrabold md:text-5xl`}>{i18n("Edit venue")}</h1>

      <EditVenue slug={slug} />
    </>
  );
};

export default async function EditVenuePage({ params }: Readonly<EditVenuePageProps>) {
  const { slug } = await params;

  return (
    <>
      <VenuePageLayout slug={slug} />
      <MixpanelTracker event="Viewed Edit Venue Page" props={{ slug }} />
    </>
  );
}
