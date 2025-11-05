import { constants } from "~/lib/constants";
import { GetPublicEventsQuery, Locale, Price_Type_Enum } from "~/types";

export function formatEventPrice(event: GetPublicEventsQuery["events"][number], locale: Locale): string {
  switch (event.price_type) {
    case Price_Type_Enum.Donation:
      return constants.priceTypes.DONATION.label[locale];
    case Price_Type_Enum.Free:
      return constants.priceTypes.FREE.label[locale];
    case Price_Type_Enum.Paid:
      return event.price_amount
        ? `${event.price_amount} ${event.price_currency}`
        : `${constants.priceTypes.PAID.label[locale]} (${event.price_currency})`;
    case Price_Type_Enum.SuggestedDonation:
      return event.price_amount
        ? `${event.price_amount} ${event.price_currency} (${constants.priceTypes.SUGGESTED_DONATION.label[locale].toLowerCase()})`
        : `${constants.priceTypes.SUGGESTED_DONATION.label[locale]} (${event.price_currency})`;
    default:
      return constants.priceTypes.UNKNOWN.label[locale];
  }
}

export function isEventOngoing(event: GetPublicEventsQuery["events"][number]): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);

  if (!event.end_date) {
    // If no end date, consider it ongoing only on the same day as start
    const startDay = startDate.toDateString();
    const today = now.toDateString();
    return startDay === today && now >= startDate;
  }

  const endDate = new Date(event.end_date);
  return now >= startDate && now <= endDate;
}

export function isEventPast(event: GetPublicEventsQuery["events"][number]): boolean {
  const now = new Date();
  if (event.end_date) {
    const endDate = new Date(event.end_date);
    return endDate < now;
  }
  const startDate = new Date(event.start_date);
  return startDate < now;
}

export function isEventUpcoming(event: GetPublicEventsQuery["events"][number]): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);
  return startDate > now;
}
