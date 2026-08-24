export const CONTRIBUTION_POINTS = {
  event: 15,
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
  venues,
}: CommunityContributionStats): CommunityAchievement[] {
  const normalizedEvents = normalizeCommunityPoints(events);
  const normalizedVenues = normalizeCommunityPoints(venues);
  const normalizedActiveDays = normalizeCommunityPoints(activeDays);
  const contributions = normalizedEvents + normalizedVenues;

  return [
    {
      achieved: contributions > 0,
      id: "first-contribution",
      name: "First contribution",
      target: 1,
      value: contributions,
    },
    {
      achieved: normalizedVenues >= 5,
      id: "venue-scout",
      name: "Venue Scout",
      target: 5,
      value: normalizedVenues,
    },
    {
      achieved: normalizedEvents >= 5,
      id: "event-connector",
      name: "Event Connector",
      target: 5,
      value: normalizedEvents,
    },
    {
      achieved: contributions >= 10,
      id: "local-guide",
      name: "Local guide",
      target: 10,
      value: contributions,
    },
    {
      achieved: normalizedActiveDays >= 3,
      id: "community-regular",
      name: "Community regular",
      target: 3,
      value: normalizedActiveDays,
    },
    {
      achieved: isVerified,
      id: "trusted-contributor",
      name: "Trusted contributor",
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
    venues: Math.ceil(remainingPoints / CONTRIBUTION_POINTS.venue),
  };
}
