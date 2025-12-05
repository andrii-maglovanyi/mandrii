import { OrderConfirmationView } from "~/features/Shop";

interface OrderPageProps {
  params: Promise<{
    locale: string;
    orderId: string;
  }>;
}

export default async function OrderPage({ params }: Readonly<OrderPageProps>) {
  const { orderId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <OrderConfirmationView orderId={orderId} />
    </div>
  );
}
