import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { Breadcrumbs } from "~/components/ui";
import { BuyVsRentCalculator } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

interface GuidesBuyVsRentCalculatorCountryPageProps {
  params: Promise<{ locale: Locale; country: string }>;
}

export default async function BuyVsRentCalculatorCountryPage({ params }: GuidesBuyVsRentCalculatorCountryPageProps) {
  const { locale, country } = await params;
  const i18n = await getI18n({ locale });

  // Map country parameter to calculator country ("gb" | "de")
  // Support: /buy-vs-rent-calculator/de (explicit de)
  const calculatorCountry: "gb" | "de" = country === "de" ? "de" : "gb";

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
              "Compare the financial outcomes of buying versus renting a property, based on your personal circumstances and market assumptions.",
            )}
          </p>
        </div>

        <BuyVsRentCalculator initialCountry={calculatorCountry} />
      </main>
      <MixpanelTracker event="Viewed Buy vs Rent Calculator Page" />
    </>
  );
}
