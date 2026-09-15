import type { Metadata } from "next";

import { CartView } from "~/features/Shop";
import { noIndexRobots } from "~/lib/seo";

interface CartPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const metadata: Metadata = { robots: noIndexRobots };

export default async function CartPage({ params }: Readonly<CartPageProps>) {
  await params;

  return (
    <div className="flex flex-col gap-6">
      <CartView />
    </div>
  );
}
