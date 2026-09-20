import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { PublicPageHeader } from "~/components/layout/PublicPageHeader/PublicPageHeader";
import { Breadcrumbs } from "~/components/ui";
import { SettlementRouteHub } from "~/features/Guides/SettlementRouteHub";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

interface GuidesPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function GuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;

  const i18n = await getI18n({ locale });

  return (
    <section className="flex flex-1 flex-col">
      <PublicPageHeader
        breadcrumbs={[{ title: i18n("Home"), url: "/" }]}
        title={i18n("Guides")}
        description={i18n("Practical country-specific routes and tools for settling abroad")}
      />

      <SettlementRouteHub />
      <MixpanelTracker event="Viewed New Guides Page" />
    </section>
  );
}
