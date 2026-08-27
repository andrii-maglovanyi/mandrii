export const MAX_REVIEW_TELEGRAM_DELIVERY_ATTEMPTS = 8;

export function getReviewTelegramDeliveryOutcome(attempts: number, failed = false) {
  if (!failed) return { delaySeconds: null, status: "DELIVERED" as const };

  const terminal = attempts >= MAX_REVIEW_TELEGRAM_DELIVERY_ATTEMPTS;
  return {
    delaySeconds: Math.min(3600, 2 ** Math.min(attempts, 11)),
    status: terminal ? ("FAILED" as const) : ("PENDING" as const),
  };
}
