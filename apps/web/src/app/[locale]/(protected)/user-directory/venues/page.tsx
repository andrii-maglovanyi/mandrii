import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { EditVenue } from "~/features";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

interface AddVenuePageLayoutProps {
  locale: Locale;
}

interface AddVenuePageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

const VenuePageLayout = ({ locale }: AddVenuePageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Venues"), url: `/${locale}/user-directory#Venues` }]} />
      <h1 className={`text-on-surface mb-12 text-3xl font-extrabold md:text-5xl`}>{i18n("Add venue")}</h1>

      <EditVenue />
    </>
  );
};

export default async function VenuePage({ params }: Readonly<AddVenuePageProps>) {
  const { locale } = await params;

  return (
    <>
      <VenuePageLayout locale={locale} />
      <MixpanelTracker event="Viewed Add Venue Page" />
    </>
  );
}
