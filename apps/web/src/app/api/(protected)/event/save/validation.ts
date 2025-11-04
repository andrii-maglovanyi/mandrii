import { privateConfig } from "~/lib/config/private";
import { fetchEventBySlug } from "~/lib/graphql/queries";

/**
 * Check if an event slug is unique (not already used).
 *
 * @param slug - The slug to check.
 * @returns True if the slug is unique, false otherwise.
 */
export const checkIsSlugUnique = async (slug: string): Promise<boolean> => {
  const event = await fetchEventBySlug(slug, privateConfig.hasura.adminSecret);
  return event === null;
};

