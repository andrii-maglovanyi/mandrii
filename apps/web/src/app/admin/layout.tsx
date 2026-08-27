import "../globals.css";

import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";

import { AdminLayout } from "~/components/layout";
import { NotificationsTicker } from "~/components/layout/NotificationsTicker/NotificationsTicker";
import AuthProvider from "~/contexts/AuthContext";
import { DialogProvider } from "~/contexts/DialogContext";
import { NotificationsProvider } from "~/contexts/NotificationsContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import ApolloWrapper from "~/lib/apollo/provider";
import { requireAuth } from "~/lib/auth/requireAuth";
import { UserModel } from "~/lib/models/user";
import type { AuthenticatedSession } from "~/lib/api/context";

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await requireAuth("/admin", "/en/account-inactive");
  const user = await new UserModel(session as unknown as AuthenticatedSession).findById(session.user.id);

  if (user?.role !== "admin") {
    return redirect("/");
  }

  return (
    <html lang="en">
      <body>
        <ApolloWrapper>
          <AuthProvider>
            <ThemeProvider>
              <NextIntlClientProvider>
                <DialogProvider>
                  <NotificationsProvider>
                    <AdminLayout>{children}</AdminLayout>
                    <NotificationsTicker />
                  </NotificationsProvider>
                </DialogProvider>
              </NextIntlClientProvider>
            </ThemeProvider>
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
