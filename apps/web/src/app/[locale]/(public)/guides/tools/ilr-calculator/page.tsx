import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { Breadcrumbs } from "~/components/ui";
import { ILRCalculator } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

interface GuidesILRCalculatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ToolsPage({ params }: GuidesILRCalculatorPageProps) {
  const { locale } = await params;
  const i18n = await getI18n({ locale });

  return (
    <>
      <main>
        <Breadcrumbs
          items={[
            { title: i18n("Guides"), url: `/guides` },
            { title: i18n("Tools"), url: `/guides/tools` },
            { title: i18n("ILR calculator") },
          ]}
        />
        <div className="mt-6 mb-10 space-y-3">
          <h1 className={`
            text-3xl font-extrabold text-on-surface
            md:text-5xl
          `}>{i18n("ILR calculator")}</h1>
          <p className={`
            text-sm text-neutral
            md:text-base
          `}>{i18n("See your earliest ILR date and estimated fees")}</p>
        </div>

        <ILRCalculator />
      </main>
      <MixpanelTracker event="Viewed ILR Calculator Page" />
    </>
  );
}
