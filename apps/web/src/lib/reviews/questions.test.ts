import { describe, expect, it } from "vitest";

import { getReviewQuestions, hasValidReviewAspectRatings } from "./questions";

const venueCategories = [
  "ACCOMMODATION",
  "BEAUTY_SALON",
  "CAFE",
  "CATERING",
  "CHURCH",
  "CLUB",
  "CULTURAL_CENTRE",
  "DELIVERY",
  "GROCERY_STORE",
  "LEGAL_SERVICE",
  "LIBRARY",
  "MEDIA",
  "MEDICAL",
  "ORGANIZATION",
  "RESTAURANT",
  "SCHOOL",
  "SHOP",
  "THEATRE",
];
const eventTypes = [
  "CELEBRATION",
  "CHARITY",
  "CONCERT",
  "CONFERENCE",
  "EXHIBITION",
  "FESTIVAL",
  "GATHERING",
  "OTHER",
  "SCREENING",
  "SPORTS",
  "THEATER",
  "WORKSHOP",
];

describe("review question sets", () => {
  it("defines three focused aspects for every event and venue, except the justified four- and five-aspect venue sets", () => {
    for (const category of venueCategories) {
      const count = getReviewQuestions("venue", category).length;
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    }
    for (const eventType of eventTypes) {
      expect(getReviewQuestions("event", eventType)).toHaveLength(3);
    }
  });

  it("uses the category-specific grocery and concert criteria", () => {
    expect(getReviewQuestions("venue", "GROCERY_STORE").map(({ label }) => label)).toEqual([
      "Selection & stock",
      "Freshness & quality",
      "Store cleanliness",
    ]);
    expect(getReviewQuestions("event", "CONCERT").map(({ label }) => label)).toEqual([
      "Performance quality",
      "Sound & acoustics",
      "Venue experience",
    ]);
  });

  it("keeps the original set valid for existing reviews", () => {
    const aspects = { accuracy: 5, selection: 4, welcome: 5 };
    expect(hasValidReviewAspectRatings("venue", "GROCERY_STORE", aspects, 1)).toBe(true);
    expect(hasValidReviewAspectRatings("venue", "GROCERY_STORE", aspects, 2)).toBe(false);
  });
});
