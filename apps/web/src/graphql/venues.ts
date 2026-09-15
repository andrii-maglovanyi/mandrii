import { gql } from "@apollo/client";

export const CHAIN_FRAGMENT = gql`
  fragment ChainFields on chains {
    id
    name
    slug
    logo
    country
    description_uk
    description_en
    phone_numbers
    emails
    website
    social_links
  }
`;

export const CHAIN_WITH_VENUES_FRAGMENT = gql`
  ${CHAIN_FRAGMENT}
  fragment ChainWithVenues on chains {
    ...ChainFields
    venues(where: {status: {_in: [ACTIVE, ARCHIVED]}}) {
      id
      name
      slug
      city
      country
    }
  }
`;

export const CHAIN_WITH_CHAINS_FRAGMENT = gql`
  ${CHAIN_FRAGMENT}
  fragment ChainWithChains on chains {
    ...ChainFields
    chains {
      id
      name
      slug
      country
      venues(where: {status: {_in: [ACTIVE, ARCHIVED]}}) {
        id
        name
        slug
        city
        country
      }
    }
  }
`;

// Shared venue fields fragment with chain tree
export const VENUE_FIELDS_FRAGMENT = gql`
  ${CHAIN_WITH_VENUES_FRAGMENT}
  ${CHAIN_WITH_CHAINS_FRAGMENT}
  fragment VenueFields on venues {
    id
    name
    address
    city
    country
    logo
    images
    description_uk
    description_en
    geo
    category
    emails
    website
    phone_numbers
    social_links
    slug
    status
    owner_id
    user_id
    venue_schedules {
      id
      open_time
      close_time
      day_of_week
    }
    venue_accommodation_details {
      bedrooms
      bathrooms
      max_guests
      check_in_time
      check_out_time
      minimum_stay_nights
      amenities
    }
    venue_beauty_salon_details {
      services
      appointment_required
      walk_ins_accepted
    }
    venue_restaurant_details {
      cuisine_types
      seating_capacity
      price_range
      features
    }
    venue_school_details {
      subjects
      languages_taught
      age_groups
      class_size_max
      online_classes_available
    }
    venue_shop_details {
      product_categories
      payment_methods
    }
    updated_at
    events_aggregate(where: $whereEvents) {
      aggregate {
        count
      }
    }
    chain {
      ...ChainWithVenues
      chain {
        ...ChainWithChains
      }
    }
  }
`;

export const GET_PUBLIC_VENUES = gql`
  ${VENUE_FIELDS_FRAGMENT}
  query GetPublicVenues(
    $where: venues_bool_exp!
    $whereEvents: events_bool_exp!
    $limit: Int
    $offset: Int
    $order_by: [venues_order_by!]
    $includeCount: Boolean! = true
    $includeTotal: Boolean! = false
    $totalWhere: venues_bool_exp!
  ) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...VenueFields
    }
    venues_aggregate(where: $where) @include(if: $includeCount) {
      aggregate {
        count
      }
    }
    total: venues_aggregate(where: $totalWhere) @include(if: $includeTotal) {
      aggregate {
        count
      }
    }
  }
`;

/** A deliberately small query for form pickers; card data belongs to catalog views. */
export const GET_PUBLIC_VENUE_OPTIONS = gql`
  query GetPublicVenueOptions($where: venues_bool_exp!, $limit: Int, $order_by: [venues_order_by!]) {
    venues(where: $where, limit: $limit, order_by: $order_by) {
      id
      name
      city
    }
  }
`;

export const GET_USER_VENUES = gql`
  ${VENUE_FIELDS_FRAGMENT}
  query GetUserVenues(
    $where: venues_bool_exp!
    $whereEvents: events_bool_exp
    $includeCount: Boolean! = true
    $limit: Int
    $offset: Int
    $order_by: [venues_order_by!]
  ) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...VenueFields
      postcode
      created_at
    }
    venues_aggregate(where: $where) @include(if: $includeCount) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_VENUE_BY_SLUG = gql`
  ${VENUE_FIELDS_FRAGMENT}
  query GetVenueViewBySlug($where: venues_bool_exp!, $whereEvents: events_bool_exp) {
    venues(where: $where, limit: 1) {
      ...VenueFields
      postcode
      created_at
    }
  }
`;
