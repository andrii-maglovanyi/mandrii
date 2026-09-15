import type { Metadata } from "next";

import { CheckoutView } from "~/features/Shop";
import { noIndexRobots } from "~/lib/seo";

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const metadata: Metadata = { robots: noIndexRobots };

export default async function CheckoutPage({ params }: Readonly<CheckoutPageProps>) {
  await params;

  return (
    <div className="flex flex-col gap-6">
      <CheckoutView />
    </div>
  );
}
