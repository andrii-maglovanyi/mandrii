import { Event_Status_Enum, Event_Type_Enum, Price_Type_Enum } from "~/lib/validation/event";
import type { Geography } from "./geography";
import type { Timestamp } from "./timestamp";
import type { UUID } from "./uuid";

/**
 * Event location type - flexible location handling.
 */
export type EventLocationType = "venue" | "custom" | "online" | "hybrid";

/**
 * Social links for events (stored as JSONB in database).
 */
export interface EventSocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
  [key: string]: string | undefined;
}

/**
 * Core Event interface matching database schema.
 */
export interface Event {
  id: UUID;
  title: string;
  slug: string;
  description_en: string | null;
  description_uk: string | null;
  start_date: Timestamp;
  end_date: Timestamp | null;
  event_type: Event_Type_Enum;
  venue_id: UUID | null;
  custom_location_name: string | null;
  custom_location_address: string | null;
  geo: Geography | null;
  city: string | null;
  country: string | null;
  is_online: boolean;
  image: string | null;
  images: string[] | null;
  organizer_name: string;
  organizer_contact: string | null;
  price_type: Price_Type_Enum;
  price_amount: number | null;
  price_currency: string;
  registration_url: string | null;
  registration_required: boolean;
  external_url: string | null;
  social_links: EventSocialLinks;
  language: string[] | null;
  capacity: number | null;
  age_restriction: string | null;
  accessibility_info: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  status: Event_Status_Enum;
  created_at: Timestamp;
  updated_at: Timestamp;
  user_id: UUID;
  owner_id: UUID | null;
}

/**
 * Event with venue relationship.
 */
export interface EventWithVenue extends Event {
  venue?: {
    id: UUID;
    name: string;
    slug: string;
    address: string | null;
    city: string | null;
    country: string | null;
    geo: Geography | null;
  } | null;
}

/**
 * Event with tags relationship.
 */
export interface EventWithTags extends Event {
  events_event_tags?: Array<{
    event_tag: {
      id: UUID;
      name: string;
      slug: string;
    };
  }>;
}

/**
 * Event with owner/creator information.
 */
export interface EventWithOwner extends Event {
  user?: {
    id: UUID;
    name: string | null;
    email: string;
  };
  owner?: {
    id: UUID;
    name: string | null;
    email: string;
  } | null;
}

/**
 * Full event with all relationships.
 */
export interface EventWithRelations extends EventWithVenue, EventWithTags, EventWithOwner {}

/**
 * Event card display data (minimal info for lists/cards).
 */
export interface EventCardData {
  id: UUID;
  title: string;
  slug: string;
  description_en: string | null;
  description_uk: string | null;
  start_date: Timestamp;
  end_date: Timestamp | null;
  event_type: Event_Type_Enum;
  image: string | null;
  city: string | null;
  country: string | null;
  price_type: Price_Type_Enum;
  price_amount: number | null;
  price_currency: string;
  is_online: boolean;
  venue?: {
    name: string;
    slug: string;
  } | null;
}

/**
 * Event filters for search/list pages.
 */
export interface EventFilters {
  event_type?: Event_Type_Enum | Event_Type_Enum[];
  price_type?: Price_Type_Enum | Price_Type_Enum[];
  city?: string;
  country?: string;
  is_online?: boolean;
  start_date_from?: Date | string;
  start_date_to?: Date | string;
  language?: string[];
  search?: string;
}

/**
 * Event sort options.
 */
export type EventSortBy = "start_date" | "created_at" | "title" | "price_amount";
export type EventSortOrder = "asc" | "desc";

/**
 * Helper type for event form submission (without auto-generated fields).
 */
export type EventFormSubmission = Omit<Event, "id" | "created_at" | "updated_at" | "status" | "user_id">;

/**
 * Event status labels for UI display.
 */
export const eventStatusLabels: Record<Event_Status_Enum, string> = {
  [Event_Status_Enum.DRAFT]: "Draft",
  [Event_Status_Enum.PENDING]: "Pending Approval",
  [Event_Status_Enum.ACTIVE]: "Active",
  [Event_Status_Enum.CANCELLED]: "Cancelled",
  [Event_Status_Enum.POSTPONED]: "Postponed",
  [Event_Status_Enum.COMPLETED]: "Completed",
  [Event_Status_Enum.ARCHIVED]: "Archived",
};

/**
 * Event type labels for UI display.
 */
export const eventTypeLabels: Record<Event_Type_Enum, string> = {
  [Event_Type_Enum.GATHERING]: "Gathering",
  [Event_Type_Enum.CELEBRATION]: "Celebration",
  [Event_Type_Enum.CONCERT]: "Concert",
  [Event_Type_Enum.WORKSHOP]: "Workshop",
  [Event_Type_Enum.EXHIBITION]: "Exhibition",
  [Event_Type_Enum.FESTIVAL]: "Festival",
  [Event_Type_Enum.CONFERENCE]: "Conference",
  [Event_Type_Enum.THEATER]: "Theater",
  [Event_Type_Enum.SCREENING]: "Screening",
  [Event_Type_Enum.SPORTS]: "Sports",
  [Event_Type_Enum.CHARITY]: "Charity",
  [Event_Type_Enum.OTHER]: "Other",
};

/**
 * Price type labels for UI display.
 */
export const priceTypeLabels: Record<Price_Type_Enum, string> = {
  [Price_Type_Enum.FREE]: "Free",
  [Price_Type_Enum.PAID]: "Paid",
  [Price_Type_Enum.DONATION]: "Donation",
  [Price_Type_Enum.SUGGESTED_DONATION]: "Suggested Donation",
};

/**
 * Helper function to get event location type.
 *
 * @param event - The event to check.
 * @returns The location type.
 */
export function getEventLocationType(event: Event): EventLocationType {
  if (event.venue_id && event.is_online) return "hybrid";
  if (event.venue_id) return "venue";
  if (event.is_online) return "online";
  return "custom";
}

/**
 * Helper function to check if event is upcoming.
 *
 * @param event - The event to check.
 * @returns True if event start date is in the future.
 */
export function isEventUpcoming(event: Event): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);
  return startDate > now;
}

/**
 * Helper function to check if event is ongoing.
 *
 * @param event - The event to check.
 * @returns True if event is currently happening.
 */
export function isEventOngoing(event: Event): boolean {
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

/**
 * Helper function to check if event is past.
 *
 * @param event - The event to check.
 * @returns True if event has ended.
 */
export function isEventPast(event: Event): boolean {
  const now = new Date();
  if (event.end_date) {
    const endDate = new Date(event.end_date);
    return endDate < now;
  }
  const startDate = new Date(event.start_date);
  return startDate < now;
}

/**
 * Helper function to format event price.
 *
 * @param event - The event with price info.
 * @returns Formatted price string.
 */
export function formatEventPrice(event: Pick<Event, "price_type" | "price_amount" | "price_currency">): string {
  switch (event.price_type) {
    case Price_Type_Enum.FREE:
      return "Free";
    case Price_Type_Enum.PAID:
      return event.price_amount
        ? `${event.price_amount.toFixed(2)} ${event.price_currency}`
        : `Paid (${event.price_currency})`;
    case Price_Type_Enum.DONATION:
      return "Donation";
    case Price_Type_Enum.SUGGESTED_DONATION:
      return event.price_amount
        ? `${event.price_amount.toFixed(2)} ${event.price_currency} (suggested)`
        : `Suggested donation (${event.price_currency})`;
    default:
      return "Price TBD";
  }
}
