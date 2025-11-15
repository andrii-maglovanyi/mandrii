export const PRICE_TYPES: Record<
  "DONATION" | "FREE" | "PAID" | "SUGGESTED_DONATION" | "UNKNOWN",
  {
    label: {
      en: string;
      uk: string;
    };
  }
> = {
  DONATION: { label: { en: "Donation", uk: "Донат" } },
  FREE: { label: { en: "Free", uk: "Безкоштовно" } },
  PAID: { label: { en: "Paid", uk: "Платно" } },
  SUGGESTED_DONATION: { label: { en: "Suggested Donation", uk: "Рекомендований донат" } },
  UNKNOWN: { label: { en: "Price TBD", uk: "Ціна договірна" } },
};
