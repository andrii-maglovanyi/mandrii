import { AccountStatusGate } from "~/components/layout/Auth";
import { requireAuth } from "~/lib/auth/requireAuth";

type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;
  await requireAuth(undefined, `/${locale}/account-inactive`);

  return <AccountStatusGate>{children}</AccountStatusGate>;
}
