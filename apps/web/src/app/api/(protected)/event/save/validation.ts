import { privateConfig } from "~/lib/config/private";
import { fetchEventBySlug } from "~/lib/graphql/queries";

export const checkIsSlugUnique = async (slug: string): Promise<boolean> => {
  const event = await fetchEventBySlug(slug, privateConfig.hasura.adminSecret);
  return event === null;
};
