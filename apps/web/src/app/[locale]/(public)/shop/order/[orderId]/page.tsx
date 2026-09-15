import type { Metadata } from "next";

import { OrderConfirmationView } from "~/features/Shop";
import { noIndexRobots } from "~/lib/seo";

interface OrderPageProps {
  params: Promise<{
    locale: string;
    orderId: string;
  }>;
}

export const metadata: Metadata = { robots: noIndexRobots };

export default async function OrderPage({ params }: Readonly<OrderPageProps>) {
  const { orderId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <OrderConfirmationView orderId={orderId} />
    </div>
  );
}
