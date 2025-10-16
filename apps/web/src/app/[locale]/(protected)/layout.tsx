import { requireAuth } from "~/lib/auth/requireAuth";

type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AuthLayout({ children }: AuthLayoutProps) {
  await requireAuth();
  return <>{children}</>;
}
