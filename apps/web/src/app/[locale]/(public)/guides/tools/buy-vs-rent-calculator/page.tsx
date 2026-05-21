import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { Breadcrumbs } from "~/components/ui";
import { BuyVsRentCalculator } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

interface GuidesBuyVsRentCalculatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ToolsPage({ params }: GuidesBuyVsRentCalculatorPageProps) {
  const { locale } = await params;
  const i18n = await getI18n({ locale });

  return (
    <>
      <main>
        <Breadcrumbs
          items={[
            { title: i18n("Guides"), url: `/guides` },
            { title: i18n("Tools"), url: `/guides/tools` },
            { title: i18n("Buy vs Rent calculator") },
          ]}
        />
        <div className="mt-6 mb-10 space-y-3">
          <h1 className={`text-on-surface text-3xl font-extrabold md:text-5xl`}>{i18n("Buy vs Rent calculator")}</h1>
          <p className={`text-neutral text-sm md:text-base`}>
            {i18n(
              "Compare the financial outcomes of buying versus renting a property in the UK, based on your personal circumstances and market assumptions.",
            )}
          </p>
        </div>

        <BuyVsRentCalculator />
      </main>
      <MixpanelTracker event="Viewed Buy vs Rent Calculator Page" />
    </>
  );
}
