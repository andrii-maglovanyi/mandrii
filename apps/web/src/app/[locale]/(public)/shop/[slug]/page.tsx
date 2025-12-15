import { ProductViewServer } from "~/features/Shop";

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ProductPage({ params }: Readonly<ProductPageProps>) {
  const { locale, slug } = await params;

  return (
    <div className="flex h-full grow flex-col">
      <ProductViewServer locale={locale} slug={slug} />
    </div>
  );
}
