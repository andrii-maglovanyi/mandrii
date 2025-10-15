import { EditVenue, MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

interface EditVenuePageLayoutProps {
  locale: Locale;
  slug: string;
}

interface EditVenuePageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

const VenuePageLayout = ({ locale, slug }: EditVenuePageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Venues"), url: `/${locale}/user-directory#Venues` }]} />
      <h1 className={`
        mb-12 text-3xl font-extrabold text-on-surface
        md:text-5xl
      `}>{i18n("Edit venue")}</h1>

      <EditVenue slug={slug} />
    </>
  );
};

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const { locale, slug } = await params;

  return (
    <>
      <VenuePageLayout locale={locale} slug={slug} />
      <MixpanelTracker event="Viewed Edit Venue Page" props={{ slug }} />
    </>
  );
}
