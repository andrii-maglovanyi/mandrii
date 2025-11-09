import { gql } from "@apollo/client";

/**
 * Shared GraphQL fragment for event fields.
 * Used across multiple queries to ensure consistency.
 */
export const EVENT_FIELDS_FRAGMENT = gql`
  fragment EventFields on events {
    id
    title_en
    title_uk
    slug
    description_en
    description_uk
    type
    price_type
    price_amount
    price_currency
    start_date
    end_date
    is_online
    external_url
    custom_location_address
    custom_location_name
    area
    city
    country
    geo
    images
    registration_url
    registration_required
    capacity
    age_restriction
    language
    accessibility_info
    social_links
    status
    created_at
    is_recurring
    recurrence_rule
    organizer_name
    organizer_phone_number
    organizer_email
    owner_id
    venue_id
    user_id
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
  }
`;

export const GET_PUBLIC_EVENTS = gql`
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
    total: events_aggregate {
      aggregate {
        count
      }
    }
  }
`;
