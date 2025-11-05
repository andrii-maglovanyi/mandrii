import { gql, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

import {
  APIParams,
  FilterParams,
  GetAdminVenuesQuery,
  GetPublicVenuesQuery,
  GetUserVenuesQuery,
  Venue_Category_Enum,
  Venue_Status_Enum,
} from "~/types";
import { UUID } from "~/types/uuid";

import { useGraphApi } from "./useGraphApi";

interface VenuesParams {
  category?: Venue_Category_Enum;
  country?: string;
  distance?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  name?: string;
  slug?: string;
}

export const getVenuesFilter = ({ category, country, distance, geo, name, slug }: VenuesParams) => {
  const where: FilterParams = {};

  if (slug) {
    where.slug = { _eq: slug };
    return { variables: { where } };
  }

  if (geo) {
    where.geo = {
      _st_d_within: {
        distance: distance || "100000", // default to 100km if distance not provided
        from: {
          coordinates: [geo.lng, geo.lat] as [number, number],
          type: "Point" as const,
        },
      },
    };
  }

  if (category) {
    where.category = { _eq: category.toUpperCase() };
  }

  if (country) {
    where.country = { _eq: country };
  }

  if (name) {
    where._or = [
      { name: { _ilike: `%${name}%` } },
      { city: { _ilike: `%${name}%` } },
      { area: { _ilike: `%${name}%` } },
      { address: { _ilike: `%${name}%` } },
    ];
  }

  return { variables: { where } };
};

const CHAIN_FRAGMENT = gql`
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

const CHAIN_WITH_VENUES_FRAGMENT = gql`
  ${CHAIN_FRAGMENT}
  fragment ChainWithVenues on chains {
    ...ChainFields
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
  fragment ChainWithChains on chains {
    ...ChainFields
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

// Shared venue fields fragment with chain tree
const VENUE_FIELDS_FRAGMENT = gql`
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
    events_aggregate {
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

const GET_PUBLIC_VENUES = gql`
  ${VENUE_FIELDS_FRAGMENT}
  query GetPublicVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...VenueFields
    }
    venues_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    total: venues_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const GET_USER_VENUES = gql`
  ${VENUE_FIELDS_FRAGMENT}
  query GetUserVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...VenueFields
      postcode
      created_at
    }
    venues_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

const GET_ADMIN_VENUES = gql`
  ${VENUE_FIELDS_FRAGMENT}
  query GetAdminVenues($where: venues_bool_exp!) {
    venues(where: $where, order_by: { updated_at: desc }) {
      ...VenueFields
      created_at
    }
    venues_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const UPDATE_VENUE_STATUS = gql`
  mutation UpdateVenueStatus($id: uuid!, $status: venue_status_enum!) {
    update_venues_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
      updated_at
    }
  }
`;

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

const getVenueData = <T extends Partial<GetAdminVenuesQuery["venues"][number]>>(venue: T) => {
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

export const useVenues = () => {
  const [updateStatus, { error, loading }] = useMutation(UPDATE_VENUE_STATUS, {
    awaitRefetchQueries: true,
    refetchQueries: ["GetAdminVenues"],
  });

  const updateVenueStatus = useCallback(
    async (id: UUID, status: Venue_Status_Enum) => {
      const { data } = await updateStatus({
        variables: { id, status },
      });

      return { data, error, loading };
    },
    [updateStatus, loading, error],
  );

  const useAdminVenues = (params: APIParams) => {
    const result = useGraphApi<GetAdminVenuesQuery["venues"]>(GET_ADMIN_VENUES, params);

    const transformedData = useMemo(() => result.data?.map(getVenueData), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const useUserVenues = (params?: APIParams) => {
    const { data: session } = useSession();

    const mergedParams = useMemo(
      () => ({
        ...params,
        where: {
          _and: [{ user_id: { _eq: session?.user.id } }, ...(params?.where ? [params.where] : [])],
        },
      }),
      [params, session?.user.id],
    );

    const result = useGraphApi<GetUserVenuesQuery["venues"]>(GET_USER_VENUES, mergedParams, {
      pause: !session?.user.id,
    });

    const transformedData = useMemo(() => result.data?.map(getVenueData), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const usePublicVenues = (params: APIParams) => {
    const result = useGraphApi<GetPublicVenuesQuery["venues"]>(GET_PUBLIC_VENUES, params);

    const transformedData = useMemo(() => result.data?.map(getVenueData), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const useGetVenue = (slug?: string) => {
    const queryParams = useMemo(
      () => ({
        limit: 1,
        where: {
          slug: { _eq: slug },
        },
      }),
      [slug],
    );

    const result = useGraphApi<GetUserVenuesQuery["venues"]>(GET_USER_VENUES, queryParams, { skip: !slug });

    const transformedData = useMemo(() => (result.data?.[0] ? getVenueData(result.data[0]) : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  return {
    updateVenueStatus,
    useAdminVenues,
    useGetVenue,
    usePublicVenues,
    useUserVenues,
  };
};
