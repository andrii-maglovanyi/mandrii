"use client";

import { ArrowUpRight, Star, Trophy } from "lucide-react";

import { Avatar } from "~/components/layout";
import { EmptyState } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { type LeaderboardPeriod } from "~/lib/gamification/community";

import { CommunityLevelBadge } from "./CommunityLevel";

export type LeaderboardEntry = {
  id: string;
  image: null | string;
  name: string;
  points: number;
  rank: number;
};

type CommunityLeaderboardProps = {
  currentUserEntry?: LeaderboardEntry | null;
  currentUserId?: null | string;
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
};

const rankClassNames: Record<number, string> = {
  1: "from-primary to-amber-600 bg-linear-to-br bg-clip-text text-transparent",
  2: "text-on-surface/70",
  3: "text-orange-500",
};

export const CommunityLeaderboard = ({
  currentUserEntry,
  currentUserId,
  entries,
  period,
}: CommunityLeaderboardProps) => {
  const i18n = useI18n();
  const showCurrentUserPosition = currentUserEntry && !entries.some((entry) => entry.id === currentUserEntry.id);

  if (!entries.length) {
    return (
      <EmptyState
        body={i18n("Be the first person to add a venue or event and earn community points.")}
        heading={i18n("The leaderboard is just getting started")}
        icon={<Trophy size={50} />}
      />
    );
  }

  return (
    <section aria-labelledby="leaderboard-top-contributors" className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-primary flex items-center gap-2">
            <Trophy aria-hidden size={20} />
            <span className="text-sm font-semibold tracking-wide uppercase">{i18n("Top contributors")}</span>
          </div>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl" id="leaderboard-top-contributors">
            {entries.length === 1 ? i18n("Leading the way") : i18n("Community champions")}
          </h2>
          <p className="text-neutral mt-1 text-sm">
            {period === "month" ? i18n("Points earned this month") : i18n("All-time community impact")}
          </p>
        </div>
        <span className="text-neutral text-sm">
          {entries.length === 1
            ? i18n("1 ranked contributor")
            : i18n("{count} ranked contributors", { count: entries.length })}
        </span>
      </div>

      <ol className="border-primary/20 divide-primary/20 border-y">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              className={`group/leaderboard hover:bg-surface-tint/60 focus-visible:bg-surface-tint/60 flex min-h-20 items-center gap-2 px-3 py-2.5 transition-colors hover:no-underline sm:min-h-28 sm:gap-6 sm:px-4 sm:py-4 ${
                entry.id === currentUserId ? "bg-primary/10" : ""
              }`}
              href={`/users/${entry.id}`}
            >
              <span className="w-7 shrink-0 sm:w-16">
                <span
                  aria-label={i18n("Rank {rank}", { rank: entry.rank })}
                  className={`block text-center text-2xl leading-none font-extrabold tabular-nums sm:text-5xl ${rankClassNames[entry.rank] ?? "text-neutral"}`}
                >
                  {entry.rank}
                </span>
              </span>
              <span className="relative flex h-12 shrink-0 items-center justify-center">
                <Avatar avatarSize={48} profile={entry} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold sm:text-xl">{entry.name}</span>
                <span className="mt-1.5 block sm:mt-2">
                  <CommunityLevelBadge points={entry.points} />
                </span>
              </span>
              <span className="text-primary flex shrink-0 flex-col items-end">
                <span className="inline-flex items-center gap-1">
                  <Star aria-hidden className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  <strong className="text-2xl leading-none font-extrabold tabular-nums sm:text-4xl">
                    {entry.points}
                  </strong>
                </span>
                <span className="text-neutral mt-1 text-[0.6875rem] font-semibold tracking-wide uppercase">
                  {i18n("points")}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                className="text-neutral hidden shrink-0 transition-transform group-hover/leaderboard:translate-x-0.5 group-hover/leaderboard:-translate-y-0.5 sm:block"
                size={18}
              />
            </Link>
          </li>
        ))}
      </ol>
      {showCurrentUserPosition && (
        <Link
          className="border-primary/20 bg-primary/5 hover:bg-primary/10 focus-visible:bg-primary/10 mt-4 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors hover:no-underline"
          href={`/users/${currentUserEntry.id}`}
        >
          <span>
            <span className="text-neutral block text-xs font-medium">{i18n("Your position")}</span>
            <span className="block font-semibold">{i18n("You")}</span>
          </span>
          <span className="text-primary text-right">
            <strong className="block text-2xl leading-none tabular-nums">#{currentUserEntry.rank}</strong>
            <span className="text-neutral mt-1 block text-xs font-medium tabular-nums">
              {currentUserEntry.points} {i18n("points")}
            </span>
          </span>
        </Link>
      )}
      {entries.length === 1 && (
        <p className="text-neutral mt-4 text-center text-sm">
          {i18n("More contributors will appear here as the community grows.")}
        </p>
      )}
    </section>
  );
};
