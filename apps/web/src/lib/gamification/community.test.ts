import { describe, expect, it } from "vitest";

import {
  CONTRIBUTION_POINTS,
  getCommunityAchievements,
  getCommunityLevel,
  getCommunityLevelProgress,
  getContributionsToNextLevel,
} from "./community";

describe("community gamification", () => {
  it("uses the same review award as the database trigger", () => {
    expect(CONTRIBUTION_POINTS.review).toBe(5);
  });

  it("derives levels and progress from the points balance", () => {
    expect(getCommunityLevel(0).id).toBe("newcomer");
    expect(getCommunityLevel(50).id).toBe("contributor");
    expect(getCommunityLevel(1_000).id).toBe("ambassador");
    expect(getCommunityLevel(-20).id).toBe("newcomer");

    expect(getCommunityLevelProgress(60)).toMatchObject({
      percentage: 10,
      pointsToNextLevel: 90,
    });
  });

  it("gives concrete, rounded-up contribution options for the next level", () => {
    expect(getContributionsToNextLevel(60)).toMatchObject({
      events: 6,
      reviews: 18,
      venues: 5,
    });
    expect(getContributionsToNextLevel(1_000)).toBeNull();
  });

  it("derives durable achievements and their progress without storing duplicate state", () => {
    const achievements = getCommunityAchievements({
      activeDays: 3,
      events: 5,
      isVerified: true,
      points: 150,
      reviews: 2,
      venues: 1,
    });

    expect(achievements.filter((achievement) => achievement.achieved).map((achievement) => achievement.id)).toEqual([
      "first-contribution",
      "event-connector",
      "community-regular",
      "trusted-contributor",
    ]);
    expect(achievements.find((achievement) => achievement.id === "local-guide")).toMatchObject({
      achieved: false,
      target: 10,
      value: 8,
    });
    expect(achievements.find((achievement) => achievement.id === "community-voice")).toMatchObject({
      achieved: false,
      target: 3,
      value: 2,
    });
  });
});
