import type { Metadata } from "next";

import { AccountStatusGate } from "~/components/layout/Auth";
import { requireAuth } from "~/lib/auth/requireAuth";
import { noIndexRobots } from "~/lib/seo";

type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export const metadata: Metadata = {
  robots: noIndexRobots,
};

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;
  await requireAuth(undefined, `/${locale}/account-inactive`);

  return <AccountStatusGate>{children}</AccountStatusGate>;
}
