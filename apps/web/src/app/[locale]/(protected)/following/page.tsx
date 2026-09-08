import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { FollowingAlerts } from "~/features/Following/FollowingAlerts";
import { getI18n } from "~/i18n/getI18n";
import { auth } from "~/lib/auth";
import { getContentSubscriptionAlerts } from "~/lib/models/content-subscription-alerts";
import { getContentSubscriptions } from "~/lib/models/content-subscriptions";
import type { Locale } from "~/types";
import type { UUID } from "~/types/uuid";

export const dynamic = "force-dynamic";

type FollowingPageProps = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export default async function FollowingPage({ params }: FollowingPageProps) {
  const [{ locale }, session] = await Promise.all([params, auth()]);
  // The protected layout has already required an active user. Keep this guard
  // here as well so this page never accidentally queries with an absent ID.
  if (!session?.user?.id) return null;

  const [i18n, subscriptions, alerts] = await Promise.all([
    getI18n({ locale }),
    getContentSubscriptions(session.user.id),
    getContentSubscriptionAlerts(session.user.id as UUID),
  ]);

  return (
    <div className="container mx-auto">
      <Breadcrumbs
        items={[
          { title: i18n("Home"), url: `/` },
          { title: i18n("Profile"), url: `/user-profile` },
        ]}
      />
      <FollowingAlerts initialAlerts={alerts} initialSubscriptions={subscriptions} />
      <MixpanelTracker event="Viewed Following Alerts Page" />
    </div>
  );
}
