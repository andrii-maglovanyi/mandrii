import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
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
    <>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }]} />
        <div className="mt-6 mb-12 space-y-3">
          <h1 className={`text-on-surface text-3xl font-extrabold md:text-5xl`}>{i18n("Guides")}</h1>
          <p className={`text-neutral text-sm md:text-base`}>
            {i18n("Practical country-specific routes and tools for settling abroad.")}
          </p>
        </div>

        <SettlementRouteHub />
      </main>
      <MixpanelTracker event="Viewed New Guides Page" />
    </>
  );
}
