import { ProductView } from "~/features/Shop";

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ProductPage({ params }: Readonly<ProductPageProps>) {
  const { slug } = await params;

  return (
    <div className="flex h-full grow flex-col">
      <ProductView slug={slug} />
    </div>
  );
}
