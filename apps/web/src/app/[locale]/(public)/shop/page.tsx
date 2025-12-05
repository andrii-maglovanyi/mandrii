import { ShopCatalogServer } from "~/features/Shop";

interface ShopPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ShopPage({ params }: Readonly<ShopPageProps>) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-8">
      <ShopCatalogServer locale={locale} />
    </div>
  );
}
