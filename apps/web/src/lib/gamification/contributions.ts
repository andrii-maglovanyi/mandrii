import sql from "~/lib/db/db";

import { type CommunityContributionStats } from "./community";

export type CommunityContributionCounts = Pick<
  CommunityContributionStats,
  "activeDays" | "events" | "reviews" | "venues"
>;

type ContributionCountsRow = {
  active_days: number | string;
  events: number | string;
  reviews: number | string;
  venues: number | string;
};

/** Counts published contributions and the distinct days on which points were awarded. */
export async function getCommunityContributionCounts(userId: string): Promise<CommunityContributionCounts> {
  const [result] = await sql<ContributionCountsRow[]>`
    SELECT
      (
        SELECT COUNT(*)
        FROM public.venues
        WHERE user_id = ${userId} AND status = 'ACTIVE'
      ) AS venues,
      (
        SELECT COUNT(*)
        FROM public.events
        WHERE user_id = ${userId}
          AND status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED')
      ) AS events,
      (
        SELECT COUNT(*)
        FROM public.content_ratings
        WHERE user_id = ${userId}
          AND review_body IS NOT NULL
          AND review_status = 'PUBLISHED'
      ) AS reviews,
      (
        SELECT COUNT(DISTINCT created_at::date)
        FROM public.user_point_events
        WHERE user_id = ${userId}
      ) AS active_days
  `;

  return {
    activeDays: Number(result?.active_days ?? 0),
    events: Number(result?.events ?? 0),
    reviews: Number(result?.reviews ?? 0),
    venues: Number(result?.venues ?? 0),
  };
}
