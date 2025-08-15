import { NotificationsTicker } from "~/components/layout";

import "../globals.css";

import { NotificationsProvider } from "~/contexts/NotificationsContext";
import { ThemeProvider } from "~/contexts/ThemeContext";

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function CVLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <NotificationsProvider>
            {children}
            <NotificationsTicker />
          </NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
