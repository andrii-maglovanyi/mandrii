import { CheckoutView } from "~/features/Shop";

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CheckoutPage({ params }: Readonly<CheckoutPageProps>) {
  await params;

  return (
    <div className="flex flex-col gap-6">
      <CheckoutView />
    </div>
  );
}
