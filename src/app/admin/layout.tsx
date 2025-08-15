import "../globals.css";

import { redirect } from "next/navigation";

import { AdminLayout } from "~/components/layout";
import { NotificationsTicker } from "~/components/layout/NotificationsTicker/NotificationsTicker";
import AuthProvider from "~/contexts/AuthContext";
import { DialogProvider } from "~/contexts/DialogContext";
import { NotificationsProvider } from "~/contexts/NotificationsContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import ApolloWrapper from "~/lib/apollo/provider";
import { auth } from "~/lib/auth";

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    return redirect(
      `https://mandrii.com/api/auth/signin?callbackUrl=${encodeURIComponent("https://admin.mandrii.com")}`,
    );
  }

  if (session.user.role !== "admin") {
    return redirect("/");
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ApolloWrapper>
            <ThemeProvider>
              <DialogProvider>
                <NotificationsProvider>
                  <AdminLayout>{children}</AdminLayout>
                  <NotificationsTicker />
                </NotificationsProvider>
              </DialogProvider>
            </ThemeProvider>
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
