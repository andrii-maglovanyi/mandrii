import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { EditVenue } from "~/features";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

interface EditVenuePageLayoutProps {
  locale: Locale;
  slug: string;
}

interface EditVenuePageProps {
  params: Readonly<Promise<{ locale: Locale; slug: string }>>;
}

const VenuePageLayout = ({ locale, slug }: EditVenuePageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Venues"), url: `/${locale}/user-directory#Venues` }]} />
      <h1 className={`text-on-surface mb-12 text-3xl font-extrabold md:text-5xl`}>{i18n("Edit venue")}</h1>

      <EditVenue slug={slug} />
    </>
  );
};

export default async function EditVenuePage({ params }: Readonly<EditVenuePageProps>) {
  const { locale, slug } = await params;

  return (
    <>
      <VenuePageLayout locale={locale} slug={slug} />
      <MixpanelTracker event="Viewed Edit Venue Page" props={{ slug }} />
    </>
  );
}
