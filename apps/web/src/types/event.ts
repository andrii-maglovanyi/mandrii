import { Event_Status_Enum, Event_Type_Enum, Price_Type_Enum } from "~/lib/validation/event";

import type { Geography } from "./geography";
import type { Timestamp } from "./timestamp";
import type { UUID } from "./uuid";

/**
 * Core Event interface matching database schema.
 */
export interface Event {
  accessibility_info: null | string;
  age_restriction: null | string;
  capacity: null | number;
  city: null | string;
  country: null | string;
  created_at: Timestamp;
  custom_location_address: null | string;
  custom_location_name: null | string;
  description_en: null | string;
  description_uk: null | string;
  end_date: null | Timestamp;
  event_type: Event_Type_Enum;
  external_url: null | string;
  geo: Geography | null;
  id: UUID;
  image: null | string;
  images: null | string[];
  is_online: boolean;
  is_recurring: boolean;
  language: null | string[];
  organizer_contact: null | string;
  organizer_name: string;
  owner_id: null | UUID;
  price_amount: null | number;
  price_currency: string;
  price_type: Price_Type_Enum;
  recurrence_rule: null | string;
  registration_required: boolean;
  registration_url: null | string;
  slug: string;
  social_links: EventSocialLinks;
  start_date: Timestamp;
  status: Event_Status_Enum;
  title: string;
  updated_at: Timestamp;
  user_id: UUID;
  venue_id: null | UUID;
}

/**
 * Event card display data (minimal info for lists/cards).
 */
export interface EventCardData {
  city: null | string;
  country: null | string;
  description_en: null | string;
  description_uk: null | string;
  end_date: null | Timestamp;
  event_type: Event_Type_Enum;
  id: UUID;
  image: null | string;
  is_online: boolean;
  price_amount: null | number;
  price_currency: string;
  price_type: Price_Type_Enum;
  slug: string;
  start_date: Timestamp;
  title: string;
  venue?: {
    name: string;
    slug: string;
  } | null;
}

/**
 * Event filters for search/list pages.
 */
export interface EventFilters {
  city?: string;
  country?: string;
  event_type?: Event_Type_Enum | Event_Type_Enum[];
  is_online?: boolean;
  language?: string[];
  price_type?: Price_Type_Enum | Price_Type_Enum[];
  search?: string;
  start_date_from?: Date | string;
  start_date_to?: Date | string;
}

/**
 * Helper type for event form submission (without auto-generated fields).
 */
export type EventFormSubmission = Omit<Event, "created_at" | "id" | "status" | "updated_at" | "user_id">;

/**
 * Event location type - flexible location handling.
 */
export type EventLocationType = "custom" | "hybrid" | "online" | "venue";

/**
 * Social links for events (stored as JSONB in database).
 */
export interface EventSocialLinks {
  [key: string]: string | undefined;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
  youtube?: string;
}

/**
 * Event sort options.
 */
export type EventSortBy = "created_at" | "price_amount" | "start_date" | "title";

export type EventSortOrder = "asc" | "desc";

/**
 * Event with owner/creator information.
 */
export interface EventWithOwner extends Event {
  owner?: {
    email: string;
    id: UUID;
    name: null | string;
  } | null;
  user?: {
    email: string;
    id: UUID;
    name: null | string;
  };
}

/**
 * Full event with all relationships.
 */
export interface EventWithRelations extends EventWithOwner, EventWithTags, EventWithVenue {}
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
 * Event with venue relationship.
 */
export interface EventWithVenue extends Event {
  venue?: {
    address: null | string;
    city: null | string;
    country: null | string;
    geo: Geography | null;
    id: UUID;
    name: string;
    slug: string;
  } | null;
}

/**
 * Event status labels for UI display.
 */
export const eventStatusLabels: Record<Event_Status_Enum, string> = {
  [Event_Status_Enum.ACTIVE]: "Active",
  [Event_Status_Enum.ARCHIVED]: "Archived",
  [Event_Status_Enum.CANCELLED]: "Cancelled",
  [Event_Status_Enum.COMPLETED]: "Completed",
  [Event_Status_Enum.DRAFT]: "Draft",
  [Event_Status_Enum.PENDING]: "Pending Approval",
  [Event_Status_Enum.POSTPONED]: "Postponed",
};

/**
 * Event type labels for UI display.
 */
export const eventTypeLabels: Record<Event_Type_Enum, string> = {
  [Event_Type_Enum.CELEBRATION]: "Celebration",
  [Event_Type_Enum.CHARITY]: "Charity",
  [Event_Type_Enum.CONCERT]: "Concert",
  [Event_Type_Enum.CONFERENCE]: "Conference",
  [Event_Type_Enum.EXHIBITION]: "Exhibition",
  [Event_Type_Enum.FESTIVAL]: "Festival",
  [Event_Type_Enum.GATHERING]: "Gathering",
  [Event_Type_Enum.OTHER]: "Other",
  [Event_Type_Enum.SCREENING]: "Screening",
  [Event_Type_Enum.SPORTS]: "Sports",
  [Event_Type_Enum.THEATER]: "Theater",
  [Event_Type_Enum.WORKSHOP]: "Workshop",
};

/**
 * Price type labels for UI display.
 */
export const priceTypeLabels: Record<Price_Type_Enum, string> = {
  [Price_Type_Enum.DONATION]: "Donation",
  [Price_Type_Enum.FREE]: "Free",
  [Price_Type_Enum.PAID]: "Paid",
  [Price_Type_Enum.SUGGESTED_DONATION]: "Suggested Donation",
};

/**
 * Helper function to format event price.
 *
 * @param event - The event with price info.
 * @returns Formatted price string.
 */
export function formatEventPrice(event: Pick<Event, "price_amount" | "price_currency" | "price_type">): string {
  switch (event.price_type) {
    case Price_Type_Enum.DONATION:
      return "Donation";
    case Price_Type_Enum.FREE:
      return "Free";
    case Price_Type_Enum.PAID:
      return event.price_amount
        ? `${event.price_amount.toFixed(2)} ${event.price_currency}`
        : `Paid (${event.price_currency})`;
    case Price_Type_Enum.SUGGESTED_DONATION:
      return event.price_amount
        ? `${event.price_amount.toFixed(2)} ${event.price_currency} (suggested)`
        : `Suggested donation (${event.price_currency})`;
    default:
      return "Price TBD";
  }
}

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
