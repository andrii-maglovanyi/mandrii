import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { AccountSettings } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { auth } from "~/lib/auth";
import { getContentAlertDeliveryPreferences } from "~/lib/models/content-subscription-alert-deliveries";
import { getContentUpdateNotificationPreferences } from "~/lib/models/content-updates";
import { getTelegramCommunityNotificationPreferences } from "~/lib/models/telegram-community-notifications";
import type { Locale } from "~/types";

type SettingsPageProps = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export default async function SettingsPage({ params }: SettingsPageProps) {
  const [{ locale }, session] = await Promise.all([params, auth()]);
  if (!session?.user?.id) return null;

  const [i18n, deliveryPreferences, telegramCommunityPreferences, updateNotificationPreferences] = await Promise.all([
    getI18n({ locale }),
    getContentAlertDeliveryPreferences(session.user.id),
    getTelegramCommunityNotificationPreferences(session.user.id),
    getContentUpdateNotificationPreferences(session.user.id),
  ]);

  return (
    <>
      <Breadcrumbs
        items={[
          { title: i18n("Home"), url: `/` },
          { title: i18n("Profile"), url: `/user-profile` },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl py-4 md:py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold md:text-5xl">{i18n("Settings")}</h1>
          <p className="text-neutral mt-2">{i18n("Manage preferences that apply across your account.")}</p>
        </header>
        <AccountSettings
          initialContentAlertDeliveryPreferences={deliveryPreferences}
          initialTelegramCommunityPreferences={telegramCommunityPreferences}
          initialUpdateNotificationPreferences={updateNotificationPreferences}
        />
      </main>
      <MixpanelTracker event="Viewed Settings Page" />
    </>
  );
}
