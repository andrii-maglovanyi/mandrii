import { gql } from "@apollo/client";
import { useMemo } from "react";

import { APIParams, FilterParams } from "~/types";
import { Event_Status_Enum, Event_Type_Enum, Price_Type_Enum } from "~/lib/validation/event";

import { useGraphApi } from "./useGraphApi";

interface EventsParams {
  eventType?: Event_Type_Enum;
  priceType?: Price_Type_Enum;
  distance?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  name?: string;
  slug?: string;
  dateFrom?: string;
  dateTo?: string;
  isOnline?: boolean;
}

export const getEventsFilter = ({
  eventType,
  priceType,
  distance,
  geo,
  name,
  slug,
  dateFrom,
  dateTo,
  isOnline,
}: EventsParams) => {
  const where: FilterParams = {};

  if (slug) {
    where.slug = { _eq: slug };
    return { variables: { where } };
  }

  // Only show active events
  where.status = { _eq: Event_Status_Enum.ACTIVE };

  // Filter by online/offline events
  if (isOnline !== undefined) {
    where.is_online = { _eq: isOnline };
  }

  // Geographic filtering for in-person events
  if (geo && !isOnline) {
    where.geo = {
      _st_d_within: {
        distance,
        from: {
          coordinates: [geo.lng, geo.lat],
          type: "Point",
        },
      },
    };
  }

  // Event type filter
  if (eventType) {
    where.event_type = { _eq: eventType };
  }

  // Price type filter
  if (priceType) {
    where.price_type = { _eq: priceType };
  }

  // Date range filter - only show upcoming/ongoing events
  const now = new Date().toISOString();
  if (dateFrom) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (where.start_date as any) = { _gte: dateFrom };
  } else {
    // By default, only show future events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (where.end_date as any) = { _gte: now };
  }

  if (dateTo) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (where.start_date as any) = { _lte: dateTo };
  }

  // Search by name, description, or venue
  if (name) {
    where._or = [
      { title: { _ilike: `%${name}%` } },
      { description_en: { _ilike: `%${name}%` } },
      { description_uk: { _ilike: `%${name}%` } },
      { city: { _ilike: `%${name}%` } },
      { address: { _ilike: `%${name}%` } },
      { venue: { name: { _ilike: `%${name}%` } } },
    ];
  }

  return { variables: { where } };
};

// Event fields fragment with venue relationship
const EVENT_FIELDS_FRAGMENT = gql`
  fragment EventFields on events {
    id
    title
    slug
    description_en
    description_uk
    event_type
    price_type
    price_amount
    price_currency
    start_date
    end_date
    is_online
    online_url
    address
    city
    country
    postcode
    geo
    image
    images
    registration_url
    registration_email
    max_attendees
    min_age
    max_age
    language
    accessibility_notes
    cancellation_policy
    terms_and_conditions
    social_links
    status
    created_at
    updated_at
    venue_id
    venue {
      id
      name
      slug
      city
      country
      logo
      category
      geo
    }
    owner {
      id
      name
      image
    }
  }
`;

const GET_PUBLIC_EVENTS = gql`
  ${EVENT_FIELDS_FRAGMENT}
  query GetPublicEvents($where: events_bool_exp!, $limit: Int, $offset: Int, $order_by: [events_order_by!]) {
    events(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...EventFields
    }
    events_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    total: events_aggregate(where: { status: { _eq: ACTIVE } }) {
      aggregate {
        count
      }
    }
  }
`;

export const useEvents = () => {
  const usePublicEvents = (params: APIParams) => {
    const mergedParams = useMemo(
      () => ({
        ...params,
        order_by: params.order_by ?? [{ start_date: "asc" }],
      }),
      [params],
    );

    type EventsData = Array<Record<string, unknown>>;
    const result = useGraphApi<EventsData>(GET_PUBLIC_EVENTS, mergedParams);

    return result;
  };

  return {
    usePublicEvents,
  };
};
