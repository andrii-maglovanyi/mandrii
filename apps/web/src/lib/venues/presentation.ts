import type { GetUserVenuesQuery } from "~/types";

const getChainFallback = <T>(
  venueValue: null | T | undefined,
  chainValue: null | T | undefined,
  parentChainValue: null | T | undefined,
): null | T | undefined => {
  return venueValue || chainValue || parentChainValue;
};

const getArrayFallback = <T>(
  venueArr?: null | T[],
  chainArr?: null | T[],
  parentChainArr?: null | T[],
): T[] | undefined => {
  if (venueArr?.length) return venueArr;
  if (chainArr?.length) return chainArr;
  if (parentChainArr?.length) return parentChainArr;
  return undefined;
};

export const getVenueData = <T extends Partial<GetUserVenuesQuery["venues"][number]>>(venue: T) => {
  // Type-safe chain access - only attempt if chain property might exist
  const venueWithChain = venue as {
    chain?: {
      chain?: {
        description_en?: null | string;
        description_uk?: null | string;
        emails?: null | string[];
        logo?: null | string;
        phone_numbers?: null | string[];
        social_links?: null | Record<string, string>;
        website?: null | string;
      } | null;
      description_en?: null | string;
      description_uk?: null | string;
      emails?: null | string[];
      logo?: null | string;
      phone_numbers?: null | string[];
      social_links?: null | Record<string, string>;
      website?: null | string;
    } | null;
  } & T;

  const parentChain = venueWithChain.chain?.chain;
  const chain = venueWithChain.chain;

  return {
    ...venue,
    description_en: getChainFallback(venue.description_en, chain?.description_en, parentChain?.description_en),
    description_uk: getChainFallback(venue.description_uk, chain?.description_uk, parentChain?.description_uk),
    emails: getArrayFallback(venue.emails, chain?.emails, parentChain?.emails),
    logo: getChainFallback(venue.logo, chain?.logo, parentChain?.logo),
    phone_numbers: getArrayFallback(venue.phone_numbers, chain?.phone_numbers, parentChain?.phone_numbers),
    social_links: {
      ...(parentChain?.social_links || {}),
      ...(chain?.social_links || {}),
      ...(venue.social_links || {}),
    },
    website: getChainFallback(venue.website, chain?.website, parentChain?.website),
  };
};

