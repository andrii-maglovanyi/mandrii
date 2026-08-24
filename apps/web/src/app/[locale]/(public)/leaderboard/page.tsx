import { Trophy } from "lucide-react";

import { Breadcrumbs, SegmentedNavigation } from "~/components/ui";
import { CommunityLeaderboard, type LeaderboardEntry } from "~/features/Gamification/CommunityLeaderboard";
import { getI18n } from "~/i18n/getI18n";
import { auth } from "~/lib/auth";
import sql from "~/lib/db/db";
import { type LeaderboardPeriod } from "~/lib/gamification/community";
import { getPublicUserImageUrl } from "~/lib/models/user";
import { Locale } from "~/types";

export const dynamic = "force-dynamic";

type LeaderboardRow = Omit<LeaderboardEntry, "name" | "rank"> & {
  name: null | string;
  rank: number | string;
};

interface LeaderboardPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function LeaderboardPage({ params, searchParams }: Readonly<LeaderboardPageProps>) {
  const { locale } = await params;
  const { period: periodParam } = await searchParams;
  const period: LeaderboardPeriod = periodParam === "month" ? "month" : "all-time";
  const [i18n, session] = await Promise.all([getI18n({ locale }), auth()]);
  const leaderboardRows =
    period === "month"
      ? sql<LeaderboardRow[]>`
          WITH monthly_scores AS (
            SELECT user_id, SUM(points)::integer AS points
            FROM public.user_point_events
            WHERE created_at >= date_trunc('month', NOW())
            GROUP BY user_id
          ), ranked_users AS (
            SELECT
              users.id,
              users.joined_at,
              users.name,
              users.image,
              monthly_scores.points,
              DENSE_RANK() OVER (ORDER BY monthly_scores.points DESC) AS rank
            FROM monthly_scores
            INNER JOIN public.users ON users.id = monthly_scores.user_id
            WHERE users.role <> 'admin'
              AND users.status = 'active'
              AND monthly_scores.points > 0
          )
          SELECT
            id,
            name,
            image,
            points,
            rank
          FROM ranked_users
          WHERE rank <= 50 OR id = ${session?.user?.id ?? null}
          ORDER BY rank ASC, joined_at ASC NULLS LAST, id ASC
        `
      : sql<LeaderboardRow[]>`
          WITH ranked_users AS (
            SELECT
              id,
              joined_at,
              name,
              image,
              points,
              DENSE_RANK() OVER (ORDER BY points DESC) AS rank
            FROM public.users
            WHERE role <> 'admin'
              AND status = 'active'
              AND points > 0
          )
          SELECT
            id,
            name,
            image,
            points,
            rank
          FROM ranked_users
          WHERE rank <= 50 OR id = ${session?.user?.id ?? null}
          ORDER BY rank ASC, joined_at ASC NULLS LAST, id ASC
        `;
  const rows = await leaderboardRows;

  const rankedEntries = rows.map((row) => ({
    ...row,
    image: getPublicUserImageUrl(row.image),
    name: row.name ?? i18n("Someone"),
    rank: Number(row.rank),
  }));
  const entries = rankedEntries.filter((entry) => entry.rank <= 50);
  const currentUserEntry = rankedEntries.find((entry) => entry.id === session?.user?.id) ?? null;

  return (
    <div className="container mx-auto">
      <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }]} />
      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="from-primary to-secondary bg-linear-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl">
            {i18n("Community leaderboard")}
          </h1>
          <p className="text-neutral mt-3 max-w-3xl">
            {i18n("Celebrating people who strengthen the Ukrainian community by adding useful places and events.")}
          </p>
          <SegmentedNavigation
            ariaLabel={i18n("Leaderboard period")}
            className="mt-5"
            items={[
              { current: period === "all-time", href: "/leaderboard", label: i18n("All time") },
              { current: period === "month", href: "/leaderboard?period=month", label: i18n("This month") },
            ]}
          />
        </div>
      </section>
      <CommunityLeaderboard
        currentUserEntry={currentUserEntry}
        currentUserId={session?.user?.id}
        entries={entries}
        period={period}
      />
    </div>
  );
}
