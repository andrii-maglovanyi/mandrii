"use client";

import { ArrowUpRight, Crown, Hammer, Sparkles, Sprout, Trophy } from "lucide-react";

import { Button } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import {
  COMMUNITY_LEVELS,
  CONTRIBUTION_POINTS,
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

type CommunityLevelProgressProps = CommunityLevelBadgeProps & {
  isVerified?: boolean;
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

export const CommunityLevelProgress = ({ isVerified = false, points }: CommunityLevelProgressProps) => {
  const i18n = useI18n();
  const { openCustomDialog } = useDialog();
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
  const reviewLabel = contributionGoal
    ? contributionGoal.reviews === 1
      ? i18n("1 published review")
      : i18n("{count} published reviews", { count: contributionGoal.reviews })
    : null;
  const openLevelDetails = () => {
    void openCustomDialog({
      children: <CommunityLevelDetails isVerified={isVerified} points={points} />,
      title: i18n("Community levels"),
    });
  };
  const levelDetailsButton = (
    <Button color="primary" onClick={openLevelDetails} className="mt-2" variant="filled">
      {i18n("Level details")}
    </Button>
  );

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
          {contributionGoal && venueLabel && eventLabel && reviewLabel && (
            <p className="mt-1 text-sm">
              {i18n("Add {venues}, {events}, or {reviews} to reach {level}", {
                events: eventLabel,
                level: i18n(contributionGoal.nextLevel.name),
                reviews: reviewLabel,
                venues: venueLabel,
              })}
            </p>
          )}
          <div className="flex justify-end">{levelDetailsButton}</div>
        </div>
      ) : (
        <div className="mt-3 pl-13 sm:pl-14">
          <p>{i18n("You have reached the highest community level")}</p>
          <div className="flex justify-end">{levelDetailsButton}</div>
        </div>
      )}
    </div>
  );
};

const CommunityLevelDetails = ({ isVerified, points }: CommunityLevelProgressProps) => {
  const i18n = useI18n();
  const currentLevel = getCommunityLevel(points);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold">{i18n("How points work")}</h3>
        <p className="text-neutral mt-1 text-sm">
          {i18n("Points are awarded for published venues, events, and written reviews.")}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="bg-primary/5 rounded-lg p-3">
            <dt className="text-neutral text-sm">{i18n("Venue")}</dt>
            <dd className="text-primary mt-1 text-lg font-semibold">
              {CONTRIBUTION_POINTS.venue} {i18n("points")}
            </dd>
          </div>
          <div className="bg-primary/5 rounded-lg p-3">
            <dt className="text-neutral text-sm">{i18n("Event")}</dt>
            <dd className="text-primary mt-1 text-lg font-semibold">
              {CONTRIBUTION_POINTS.event} {i18n("points")}
            </dd>
          </div>
          <div className="bg-primary/5 rounded-lg p-3">
            <dt className="text-neutral text-sm">{i18n("Written review")}</dt>
            <dd className="text-primary mt-1 text-lg font-semibold">
              {CONTRIBUTION_POINTS.review} {i18n("points")}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="text-lg font-semibold">{i18n("Levels")}</h3>
        <ol className="border-primary/20 divide-primary/20 mt-3 divide-y rounded-lg border">
          {COMMUNITY_LEVELS.map((level) => {
            const Icon = levelIcons[level.id];
            const isCurrentLevel = level.id === currentLevel.id;

            return (
              <li className={`flex items-center gap-3 p-3 ${isCurrentLevel ? "bg-primary/10" : ""}`} key={level.id}>
                <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <Icon aria-hidden size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{i18n(level.name)}</span>
                  <span className="text-neutral block text-sm">
                    {i18n("{points} points", { points: level.minPoints })}
                  </span>
                </span>
                {isCurrentLevel && <span className="text-primary text-sm font-semibold">{i18n("Current")}</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="bg-secondary/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold">{i18n("Beacon")}</h3>
        <p className="text-neutral mt-1 text-sm">
          {isVerified
            ? i18n("You can manage the publication status of your own venues and events.")
            : i18n(
                "This status is reviewed by the platform for contributors who consistently provide accurate information.",
              )}
        </p>
      </section>
    </div>
  );
};
