import { CartView } from "~/features/Shop";

interface CartPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CartPage({ params }: Readonly<CartPageProps>) {
  await params;

  return (
    <div className="flex flex-col gap-6">
      <CartView />
    </div>
  );
}
