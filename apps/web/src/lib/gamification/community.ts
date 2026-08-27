export const CONTRIBUTION_POINTS = {
  event: 15,
  review: 5,
  venue: 20,
} as const;

export type LeaderboardPeriod = "all-time" | "month";

export const COMMUNITY_LEVELS = [
  { id: "newcomer", minPoints: 0, name: "Newcomer" },
  { id: "contributor", minPoints: 50, name: "Contributor" },
  { id: "builder", minPoints: 150, name: "Community Builder" },
  { id: "champion", minPoints: 400, name: "Community Champion" },
  { id: "ambassador", minPoints: 1_000, name: "Mandrii Ambassador" },
] as const;

export type CommunityLevel = (typeof COMMUNITY_LEVELS)[number];

export type CommunityLevelProgress = {
  currentPoints: number;
  level: CommunityLevel;
  nextLevel: CommunityLevel | null;
  percentage: number;
  pointsToNextLevel: number;
};

export type CommunityAchievementId =
  | "community-voice"
  | "event-connector"
  | "first-contribution"
  | "local-guide"
  | "community-regular"
  | "trusted-contributor"
  | "venue-scout";

export type CommunityAchievement = {
  achieved: boolean;
  id: CommunityAchievementId;
  name: string;
  target: number;
  value: number;
};

export type CommunityContributionStats = {
  activeDays: number;
  events: number;
  isVerified: boolean;
  points: number;
  reviews: number;
  venues: number;
};

export function normalizeCommunityPoints(points: number): number {
  return Number.isFinite(points) ? Math.max(0, points) : 0;
}

export function getCommunityLevel(points: number): CommunityLevel {
  const normalizedPoints = normalizeCommunityPoints(points);

  for (let index = COMMUNITY_LEVELS.length - 1; index >= 0; index -= 1) {
    const level = COMMUNITY_LEVELS[index];

    if (normalizedPoints >= level.minPoints) return level;
  }

  return COMMUNITY_LEVELS[0];
}

export function getNextCommunityLevel(points: number): CommunityLevel | null {
  const normalizedPoints = normalizeCommunityPoints(points);

  return COMMUNITY_LEVELS.find((level) => level.minPoints > normalizedPoints) ?? null;
}

export function getCommunityLevelProgress(points: number): CommunityLevelProgress {
  const currentPoints = normalizeCommunityPoints(points);
  const level = getCommunityLevel(currentPoints);
  const nextLevel = getNextCommunityLevel(currentPoints);

  if (!nextLevel) {
    return { currentPoints, level, nextLevel, percentage: 100, pointsToNextLevel: 0 };
  }

  const range = nextLevel.minPoints - level.minPoints;

  return {
    currentPoints,
    level,
    nextLevel,
    percentage: Math.min(100, ((currentPoints - level.minPoints) / range) * 100),
    pointsToNextLevel: Math.max(0, nextLevel.minPoints - currentPoints),
  };
}

export function getCommunityAchievements({
  activeDays,
  events,
  isVerified,
  reviews,
  venues,
}: CommunityContributionStats): CommunityAchievement[] {
  const normalizedEvents = normalizeCommunityPoints(events);
  const normalizedVenues = normalizeCommunityPoints(venues);
  const normalizedReviews = normalizeCommunityPoints(reviews);
  const normalizedActiveDays = normalizeCommunityPoints(activeDays);
  const contributions = normalizedEvents + normalizedVenues + normalizedReviews;

  return [
    {
      achieved: contributions > 0,
      id: "first-contribution",
      name: "Spark",
      target: 1,
      value: contributions,
    },
    {
      achieved: normalizedVenues >= 5,
      id: "venue-scout",
      name: "Scout",
      target: 5,
      value: normalizedVenues,
    },
    {
      achieved: normalizedEvents >= 5,
      id: "event-connector",
      name: "Gatherer",
      target: 5,
      value: normalizedEvents,
    },
    {
      achieved: normalizedReviews >= 3,
      id: "community-voice",
      name: "Storyteller",
      target: 3,
      value: normalizedReviews,
    },
    {
      achieved: contributions >= 10,
      id: "local-guide",
      name: "Wayfinder",
      target: 10,
      value: contributions,
    },
    {
      achieved: normalizedActiveDays >= 3,
      id: "community-regular",
      name: "Steady",
      target: 3,
      value: normalizedActiveDays,
    },
    {
      achieved: isVerified,
      id: "trusted-contributor",
      name: "Beacon",
      target: 1,
      value: Number(isVerified),
    },
  ];
}

export function getContributionsToNextLevel(points: number) {
  const nextLevel = getNextCommunityLevel(points);

  if (!nextLevel) return null;

  const remainingPoints = Math.max(0, nextLevel.minPoints - normalizeCommunityPoints(points));

  return {
    events: Math.ceil(remainingPoints / CONTRIBUTION_POINTS.event),
    nextLevel,
    reviews: Math.ceil(remainingPoints / CONTRIBUTION_POINTS.review),
    venues: Math.ceil(remainingPoints / CONTRIBUTION_POINTS.venue),
  };
}
