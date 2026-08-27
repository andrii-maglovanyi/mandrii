import { notFound } from "next/navigation";

import { Breadcrumbs } from "~/components/ui";
import { PublicUserProfile } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { auth } from "~/lib/auth";
import sql from "~/lib/db/db";
import { getCommunityContributionCounts } from "~/lib/gamification/contributions";
import { getPublicUserImageUrl, UserModel } from "~/lib/models/user";
import { Locale } from "~/types";
import type { PublicEventContribution, PublicVenueContribution } from "~/features/UserProfile/PublicContributions";

export const dynamic = "force-dynamic";

interface PublicUserProfilePageProps {
  params: Promise<{ id: string; locale: Locale }>;
}

export default async function PublicUserProfilePage({ params }: Readonly<PublicUserProfilePageProps>) {
  const { id, locale } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const [i18n, profile, venues, events, contributionCounts, session] = await Promise.all([
    getI18n({ locale }),
    new UserModel().findPublicById(id),
    sql<PublicVenueContribution[]>`
      SELECT name, slug, city, country, created_at, logo, images, status
      FROM venues
      WHERE user_id = ${id} AND status = 'ACTIVE'
      ORDER BY created_at DESC
      LIMIT 5
    `,
    sql<PublicEventContribution[]>`
      SELECT title_en, title_uk, slug, start_date, end_date, is_online, is_recurring, status, city, country, created_at, images
      FROM events
      WHERE user_id = ${id}
        AND status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED')
      ORDER BY created_at DESC
      LIMIT 5
    `,
    getCommunityContributionCounts(id),
    auth(),
  ]);
  if (!profile) notFound();
  const name = profile.name || i18n("Someone");

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }, { title: name }]} />
      <PublicUserProfile
        events={events}
        isOwnProfile={session?.user?.id === id}
        profile={{
          ...profile,
          active_day_count: contributionCounts.activeDays,
          event_count: contributionCounts.events,
          image: getPublicUserImageUrl(profile.image),
          name,
          review_count: contributionCounts.reviews,
          venue_count: contributionCounts.venues,
        }}
        venues={venues}
      />
    </>
  );
}
