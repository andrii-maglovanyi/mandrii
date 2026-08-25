"use client";

import { Crown, Hammer, Sparkles, Sprout, Trophy } from "lucide-react";

import {
  getCommunityLevel,
  getCommunityLevelProgress,
  getContributionsToNextLevel,
} from "~/lib/gamification/community";
import { useI18n } from "~/i18n/useI18n";

const levelIcons = {
  ambassador: Crown,
  builder: Hammer,
  champion: Trophy,
  contributor: Sparkles,
  newcomer: Sprout,
};

type CommunityLevelBadgeProps = {
  points: number;
};

export const CommunityLevelBadge = ({ points }: CommunityLevelBadgeProps) => {
  const i18n = useI18n();
  const level = getCommunityLevel(points);
  const Icon = levelIcons[level.id];

  return (
    <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold">
      <Icon aria-hidden size={14} />
      {i18n(level.name)}
    </span>
  );
};

export const CommunityLevelProgress = ({ points }: CommunityLevelBadgeProps) => {
  const i18n = useI18n();
  const { currentPoints, level, nextLevel, percentage, pointsToNextLevel } = getCommunityLevelProgress(points);
  const contributionGoal = getContributionsToNextLevel(points);
  const Icon = levelIcons[level.id];
  const venueLabel = contributionGoal
    ? contributionGoal.venues === 1
      ? i18n("1 approved venue")
      : i18n("{count} approved venues", { count: contributionGoal.venues })
    : null;
  const eventLabel = contributionGoal
    ? contributionGoal.events === 1
      ? i18n("1 approved event")
      : i18n("{count} approved events", { count: contributionGoal.events })
    : null;

  return (
    <div className="from-secondary/15 to-primary/15 rounded-3xl bg-linear-to-br p-4 shadow-md sm:p-5">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11">
          <Icon aria-hidden size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-neutral text-sm font-medium">{i18n("Level")}</p>
              <p className="text-xl font-semibold sm:text-2xl">{i18n(level.name)}</p>
            </div>
            {nextLevel ? (
              <p className="text-primary shrink-0 text-xl font-semibold tabular-nums sm:text-2xl">
                {currentPoints}
                <span className="text-neutral"> / {nextLevel.minPoints}</span> {i18n("points")}
              </p>
            ) : (
              <p className="text-primary shrink-0 text-xl font-semibold tabular-nums sm:text-2xl">
                {currentPoints} {i18n("points")}
              </p>
            )}
          </div>
        </div>
      </div>
      {nextLevel ? (
        <div className="mt-4 pl-13 sm:pl-14">
          <div
            aria-label={i18n("Progress to {level}", { level: i18n(nextLevel.name) })}
            aria-valuemax={nextLevel.minPoints}
            aria-valuemin={level.minPoints}
            aria-valuenow={currentPoints}
            className="bg-on-surface/10 h-2.5 overflow-hidden rounded-full"
            role="progressbar"
          >
            <div
              className="from-primary to-secondary h-full rounded-full bg-linear-to-r"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-6 text-sm">
            {i18n("{points} points to {level}", {
              level: i18n(nextLevel.name),
              points: pointsToNextLevel,
            })}
          </p>
          {contributionGoal && venueLabel && eventLabel && (
            <p className="mt-1 text-sm">
              {i18n("Add {venues} or {events} to reach {level}", {
                events: eventLabel,
                level: i18n(contributionGoal.nextLevel.name),
                venues: venueLabel,
              })}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 pl-13 sm:pl-14">{i18n("You have reached the highest community level")}</p>
      )}
    </div>
  );
};
