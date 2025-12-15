import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { ShopCatalogServer } from "~/features";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

interface ShopPageLayoutProps {
  locale: Locale;
}

interface ShopPageProps {
  params: Promise<{ locale: Locale }>;
}

const ShopPageLayout = ({ locale }: ShopPageLayoutProps) => {
  const i18n = useI18n();

  return (
    <div className="container mx-auto">
      <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }]} />

      <div className={`mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}>
        <h1
          className={`from-primary to-secondary bg-linear-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl`}
        >
          {i18n("Shop")}
        </h1>
      </div>
      <div className="flex flex-col gap-8">
        <ShopCatalogServer locale={locale} />
      </div>
    </div>
  );
};

export default async function ShopPage({ params }: Readonly<ShopPageProps>) {
  const { locale } = await params;

  return (
    <>
      <ShopPageLayout locale={locale} />
      <MixpanelTracker event="Viewed Shop Page" />
    </>
  );
}
