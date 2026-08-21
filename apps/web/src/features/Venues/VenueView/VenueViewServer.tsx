import { gql } from "@apollo/client";
import { Alert } from "~/components/ui";
import { EVENT_FIELDS_FRAGMENT, GET_PUBLIC_EVENTS } from "~/graphql/events";
import { getServerClient } from "~/lib/apollo/server-client";
import { auth } from "~/lib/auth";
import sql from "~/lib/db/db";
import {
  GetPublicEventsQuery,
  GetPublicEventsQueryVariables,
  GetVenueViewBySlugQuery,
  GetVenueViewBySlugQueryVariables,
  Order_By,
} from "~/types/graphql.generated";

import { VenueView } from "./VenueView";
import { getI18n } from "~/i18n/getI18n";

const CHAIN_FRAGMENT = gql`
  fragment VenueViewChainFields on chains {
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

const CHAIN_WITH_VENUES_FRAGMENT = gql`
  ${CHAIN_FRAGMENT}
  fragment VenueViewChainWithVenues on chains {
    ...VenueViewChainFields
    venues {
      id
      name
      slug
      city
      country
    }
    venues_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const CHAIN_WITH_CHAINS_FRAGMENT = gql`
  ${CHAIN_FRAGMENT}
  fragment VenueViewChainWithChains on chains {
    ...VenueViewChainFields
    chains {
      id
      name
      slug
      country
      venues {
        id
        name
        slug
        city
        country
      }
      venues_aggregate {
        aggregate {
          count
        }
      }
    }
    chains_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const VENUE_FIELDS_FRAGMENT = gql`
  ${CHAIN_WITH_VENUES_FRAGMENT}
  ${CHAIN_WITH_CHAINS_FRAGMENT}
  fragment VenueViewFields on venues {
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
    events_aggregate {
      aggregate {
        count
      }
    }
    chain {
      ...VenueViewChainWithVenues
      chain {
        ...VenueViewChainWithChains
      }
    }
  }
`;

const GET_VENUE_BY_SLUG = gql`
  ${VENUE_FIELDS_FRAGMENT}
  query GetVenueViewBySlug($where: venues_bool_exp!) {
    venues(where: $where, limit: 1) {
      ...VenueViewFields
      postcode
      created_at
    }
  }
`;

interface VenueViewServerProps {
  slug: string;
  locale: string;
}

export async function VenueViewServer({ slug, locale }: VenueViewServerProps) {
  const i18n = await getI18n({ locale });

  try {
    const client = await getServerClient();

    // Fetch venue data
    const { data: venueData } = await client.query<GetVenueViewBySlugQuery, GetVenueViewBySlugQueryVariables>({
      query: GET_VENUE_BY_SLUG,
      variables: {
        where: {
          slug: { _eq: slug },
        },
      },
    });

    const venue = venueData?.venues?.[0];

    if (!venue) {
      return <VenueView initialVenue={null} initialEvents={[]} slug={slug} />;
    }

    // Fetch events for the venue
    const { data: eventsData } = await client.query<GetPublicEventsQuery, GetPublicEventsQueryVariables>({
      query: GET_PUBLIC_EVENTS,
      variables: {
        limit: 100,
        offset: 0,
        order_by: [{ start_date: Order_By.Asc }],
        where: {
          _or: [
            { end_date: { _gte: new Date().toISOString() as any } },
            { start_date: { _gte: new Date().toISOString() as any } },
          ],
          venue_id: { _eq: venue.id },
        },
      },
    });

    const events = eventsData?.events ?? [];

    const session = await auth();
    const sessionUserId = session?.user?.id;
    const [messagingVenue] = await sql<{ owner_id: null | string; telegram_chat_id: null | string }[]>`
      SELECT owner_id, telegram_chat_id FROM venues WHERE id = ${venue.id}
    `;
    const initialMessagingRole =
      sessionUserId && messagingVenue?.owner_id ? (messagingVenue.owner_id === sessionUserId ? "OWNER" : "USER") : null;

    return (
      <VenueView
        initialEvents={events}
        initialMessagingRole={initialMessagingRole}
        initialTelegramLinked={initialMessagingRole === "OWNER" ? Boolean(messagingVenue?.telegram_chat_id) : null}
        initialVenue={venue}
        slug={slug}
      />
    );
  } catch (error) {
    console.error("Error fetching venue data:", error);

    return <Alert variant="warning">{i18n("Venue is not available at the moment. Please try again later.")}</Alert>;
  }
}
