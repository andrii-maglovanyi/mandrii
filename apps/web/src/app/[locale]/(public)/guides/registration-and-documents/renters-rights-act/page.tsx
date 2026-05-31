import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { Breadcrumbs } from "~/components/ui";
import { RentersRightsAct } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

interface RentersRightsActPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function RentersRightsActPage({ params }: RentersRightsActPageProps) {
  const { locale } = await params;
  const i18n = await getI18n({ locale });

  return (
    <>
      <main>
        <Breadcrumbs
          items={[
            { title: i18n("Guides"), url: `/guides` },
            { title: i18n("Renting in the UK"), url: `/guides/renting` },
            { title: i18n("Renters' Rights Act 2025") },
          ]}
        />
        <div className="mt-6 mb-10 space-y-3">
          <h1 className={`text-on-surface text-3xl font-extrabold md:text-5xl`}>{i18n("Renters' Rights Act 2025")}</h1>
          <p className={`text-neutral text-sm md:text-base`}>
            {i18n("Understand your new rights and protections as a private tenant from 1 May 2026")}
          </p>
        </div>

        <RentersRightsAct />
      </main>
      <MixpanelTracker event="Viewed Renters Rights Act Page" />
    </>
  );
}
