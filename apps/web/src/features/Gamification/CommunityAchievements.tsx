"use client";

import {
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  Compass,
  LockKeyhole,
  MapPinned,
  MessageSquareText,
} from "lucide-react";

import { getCommunityAchievements, type CommunityContributionStats } from "~/lib/gamification/community";
import { useI18n } from "~/i18n/useI18n";

const achievementIcons = {
  "community-regular": CalendarRange,
  "community-voice": MessageSquareText,
  "event-connector": CalendarDays,
  "first-contribution": BadgeCheck,
  "local-guide": Compass,
  "trusted-contributor": BadgeCheck,
  "venue-scout": MapPinned,
};

type CommunityAchievementsProps = CommunityContributionStats;

const getLockedRequirement = (
  achievement: ReturnType<typeof getCommunityAchievements>[number],
  i18n: ReturnType<typeof useI18n>,
) => {
  const remaining = Math.max(0, achievement.target - achievement.value);

  switch (achievement.id) {
    case "first-contribution":
      return i18n("Publish your first venue, event, or written review");
    case "venue-scout":
      return remaining === 1 ? i18n("Add 1 more venue") : i18n("Add {count} more venues", { count: remaining });
    case "event-connector":
      return remaining === 1 ? i18n("Add 1 more event") : i18n("Add {count} more events", { count: remaining });
    case "community-voice":
      return remaining === 1 ? i18n("Write 1 more review") : i18n("Write {count} more reviews", { count: remaining });
    case "local-guide":
      return i18n("Publish {count} more contributions", { count: remaining });
    case "community-regular":
      return remaining === 1
        ? i18n("Contribute on 1 more day")
        : i18n("Contribute on {count} more days", { count: remaining });
    case "trusted-contributor":
      return i18n("Verification required");
  }
};

export const CommunityAchievements = (stats: CommunityAchievementsProps) => {
  const i18n = useI18n();
  const achievements = getCommunityAchievements(stats);

  return (
    <section aria-labelledby="community-achievements">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold" id="community-achievements">
          {i18n("Achievements")}
        </h3>
        <span className="text-neutral">
          {i18n("{count} of {total} unlocked", {
            count: achievements.filter((achievement) => achievement.achieved).length,
            total: achievements.length,
          })}
        </span>
      </div>
      <ul
        className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-7"
        role="list"
      >
        {achievements.map((achievement) => {
          const Icon = achievementIcons[achievement.id];
          const label = i18n(achievement.name);
          const lockedRequirement = achievement.achieved ? null : getLockedRequirement(achievement, i18n);

          return (
            <li className="flex w-40 shrink-0 snap-start self-stretch sm:w-auto" key={achievement.id}>
              <span
                className={`relative flex h-full min-h-30 w-full flex-col justify-between overflow-hidden rounded-4xl border-8 p-3 text-center text-sm font-medium ${
                  achievement.achieved
                    ? "border-primary/10 bg-primary/10 text-primary"
                    : "border-on-surface/5 bg-on-surface/5 text-neutral"
                }`}
              >
                <span
                  className={`absolute -top-10 -left-10 flex h-30 w-30 shrink-0 items-center justify-center rounded-full ${
                    achievement.achieved ? "bg-primary/10" : "bg-on-surface/5"
                  }`}
                >
                  <Icon aria-hidden size={21} />
                </span>
                {!achievement.achieved && (
                  <LockKeyhole
                    aria-hidden
                    className="absolute top-3 right-3 stroke-neutral-200 dark:stroke-neutral-700"
                    size={16}
                    strokeWidth={2.25}
                  />
                )}
                <span className="mt-10 line-clamp-2 text-xl leading-snug">{label}</span>
                {lockedRequirement && (
                  <span className="text-neutral mt-4 line-clamp-2 text-xs">{lockedRequirement}</span>
                )}
                {!achievement.achieved && <span className="sr-only">{i18n("Locked")}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
