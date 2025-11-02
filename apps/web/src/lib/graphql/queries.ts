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

const GET_VENUE_BY_SLUG_WITH_CHAIN = `
  query GetVenueBySlugWithChain($slug: String!) {
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
      chain {
        id
        name
        slug
        logo
        description_uk
        description_en
        phone_numbers
        emails
        website
        social_links
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
        chain {
          id
          name
          slug
          logo
          description_uk
          description_en
          phone_numbers
          emails
          website
          social_links
          chains {
            id
            name
            slug
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
      }
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
  const venue = await fetchVenueBySlug(slug, { adminSecret });
  return venue === null;
}

/**
 * Fetch a venue by its slug from Hasura GraphQL API
 * @param slug - The venue slug to search for
 * @param options - Optional configuration
 * @param options.adminSecret - Optional admin secret for admin access
 * @param options.includeChainData - Whether to include full chain hierarchy data
 * @returns The venue data or null if not found
 */
export async function fetchVenueBySlug(
  slug: string,
  options?: { adminSecret?: string; includeChainData?: boolean },
): Promise<null | Venues> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options?.adminSecret) {
      headers["x-hasura-admin-secret"] = options.adminSecret;
    }

    const query = options?.includeChainData ? GET_VENUE_BY_SLUG_WITH_CHAIN : GET_VENUE_BY_SLUG;

    const response = await fetch(publicConfig.hasura.endpoint, {
      body: JSON.stringify({ query, variables: { slug } }),
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
