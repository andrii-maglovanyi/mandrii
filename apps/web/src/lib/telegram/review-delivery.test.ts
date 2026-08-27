import { describe, expect, it } from "vitest";

import { getReviewTelegramDeliveryOutcome, MAX_REVIEW_TELEGRAM_DELIVERY_ATTEMPTS } from "./review-delivery";

describe("review Telegram delivery outcomes", () => {
  it("marks a successful send as delivered", () => {
    expect(getReviewTelegramDeliveryOutcome(1)).toEqual({ delaySeconds: null, status: "DELIVERED" });
  });

  it("keeps temporary failures pending with exponential backoff", () => {
    expect(getReviewTelegramDeliveryOutcome(1, true)).toEqual({ delaySeconds: 2, status: "PENDING" });
    expect(getReviewTelegramDeliveryOutcome(6, true)).toEqual({ delaySeconds: 64, status: "PENDING" });
  });

  it("caps the retry delay so repeated failures do not grow without bound", () => {
    expect(getReviewTelegramDeliveryOutcome(20, true)).toEqual(getReviewTelegramDeliveryOutcome(12, true));
    expect(getReviewTelegramDeliveryOutcome(20, true)).toMatchObject({ status: "FAILED" });
    expect(getReviewTelegramDeliveryOutcome(20, true).delaySeconds).toBeLessThanOrEqual(3600);
  });

  it("marks the final allowed attempt as terminal", () => {
    expect(getReviewTelegramDeliveryOutcome(MAX_REVIEW_TELEGRAM_DELIVERY_ATTEMPTS - 1, true).status).toBe("PENDING");
    expect(getReviewTelegramDeliveryOutcome(MAX_REVIEW_TELEGRAM_DELIVERY_ATTEMPTS, true).status).toBe("FAILED");
  });
});
