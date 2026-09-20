import { MixpanelTracker } from "~/components/layout";
import { PublicPageHeader } from "~/components/layout/PublicPageHeader/PublicPageHeader";
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
      <PublicPageHeader
        breadcrumbs={[{ title: i18n("Home"), url: "/" }]}
        title={i18n("Shop")}
        description={i18n("Useful things and little discoveries")}
      />
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
