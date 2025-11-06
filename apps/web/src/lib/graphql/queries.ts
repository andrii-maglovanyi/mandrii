import { publicConfig } from "~/lib/config/public";
import { Venues } from "~/types";

const GET_VENUE_BY_SLUG = `
  query GetVenueBySlug($slug: String!) {
    venues(where: { slug: { _eq: $slug } }, limit: 1) {
      id
      name
      slug
      address
      city
      country
      postcode
      logo
      images
      category
      description_uk
      description_en
      geo
      emails
      website
      phone_numbers
      social_links
      status
      owner_id
      user_id
    }
  }
`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Fetch a venue by its slug from Hasura GraphQL API
 * @param slug - The venue slug to search for
 * @param adminSecret - Optional admin secret for admin access
 * @returns The venue data or null if not found
 */
export async function fetchVenueBySlug(slug: string, adminSecret?: string): Promise<null | Venues> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (adminSecret) {
      headers["x-hasura-admin-secret"] = adminSecret;
    }

    const response = await fetch(publicConfig.hasura.endpoint, {
      body: JSON.stringify({ query: GET_VENUE_BY_SLUG, variables: { slug } }),
      headers,
      method: "POST",
    });

    const result: GraphQLResponse<{ venues: Venues[] }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    return result.data?.venues?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch venue:", error);
    return null;
  }
}

const GET_EVENT_BY_SLUG = `
  query GetEventBySlug($slug: String!) {
    events(where: { slug: { _eq: $slug } }, limit: 1) {
      id
      slug
      user_id
      owner_id
    }
  }
`;

/**
 * Fetch an event by its slug from Hasura GraphQL API.
 *
 * @param slug - The event slug to search for.
 * @param adminSecret - Optional admin secret for admin access.
 * @returns The event data or null if not found.
 */
export async function fetchEventBySlug(
  slug: string,
  adminSecret?: string,
): Promise<{ id: string; owner_id: null | string; slug: string; user_id: string } | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (adminSecret) {
      headers["x-hasura-admin-secret"] = adminSecret;
    }

    const response = await fetch(publicConfig.hasura.endpoint, {
      body: JSON.stringify({ query: GET_EVENT_BY_SLUG, variables: { slug } }),
      headers,
      method: "POST",
    });

    const result: GraphQLResponse<{
      events: Array<{ id: string; owner_id: null | string; slug: string; user_id: string }>;
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    return result.data?.events?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }
}
