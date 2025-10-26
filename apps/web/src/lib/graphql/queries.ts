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
 * Check if a venue slug is unique (not already taken)
 * @param slug - The slug to check
 * @param adminSecret - Hasura admin secret for privileged access
 * @returns True if the slug is unique, false otherwise
 */
export async function checkIsSlugUnique(slug: string, adminSecret: string): Promise<boolean> {
  const venue = await fetchVenueBySlug(slug, adminSecret);
  return venue === null;
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
