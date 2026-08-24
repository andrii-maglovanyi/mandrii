"use client";

import { BadgeCheck, CalendarDays, CalendarRange, Compass, LockKeyhole, MapPinned } from "lucide-react";

import { getCommunityAchievements, type CommunityContributionStats } from "~/lib/gamification/community";
import { useI18n } from "~/i18n/useI18n";

const achievementIcons = {
  "community-regular": CalendarRange,
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
      return i18n("Publish your first venue or event");
    case "venue-scout":
      return remaining === 1 ? i18n("Add 1 more venue") : i18n("Add {count} more venues", { count: remaining });
    case "event-connector":
      return remaining === 1 ? i18n("Add 1 more event") : i18n("Add {count} more events", { count: remaining });
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
        <h3 className="text-sm font-semibold" id="community-achievements">
          {i18n("Achievements")}
        </h3>
        <span className="text-neutral text-xs">
          {i18n("{count} of {total} unlocked", {
            count: achievements.filter((achievement) => achievement.achieved).length,
            total: achievements.length,
          })}
        </span>
      </div>
      <ul
        className="-mx-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6"
        role="list"
      >
        {achievements.map((achievement) => {
          const Icon = achievementIcons[achievement.id];
          const label = i18n(achievement.name);
          const lockedRequirement = achievement.achieved ? null : getLockedRequirement(achievement, i18n);

          return (
            <li className="flex w-40 shrink-0 snap-start self-stretch sm:w-auto" key={achievement.id}>
              <span
                className={`relative flex h-full min-h-30 w-full flex-col justify-between rounded-xl border p-3 text-sm font-medium ${
                  achievement.achieved
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-on-surface/10 bg-on-surface/5 text-neutral"
                }`}
              >
                <span
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    achievement.achieved ? "bg-primary/15" : "bg-on-surface/10"
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
                <span className="mt-2 line-clamp-2 leading-snug">{label}</span>
                {lockedRequirement && (
                  <span className="text-neutral mt-1 line-clamp-2 text-xs">{lockedRequirement}</span>
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
