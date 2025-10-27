import { gql, useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

import {
  APIParams,
  FilterParams,
  GetAdminVenuesQuery,
  GetPublicVenuesQuery,
  GetUserVenuesQuery,
  Venue_Category_Enum,
} from "~/types";

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
  const variables: { where: FilterParams } = {
    where: {},
  };

  if (slug) {
    variables.where.slug = {
      _eq: slug,
    };
  } else {
    if (geo) {
      variables.where.geo = {
        _st_d_within: {
          distance,
          from: {
            coordinates: [geo.lng, geo.lat],
            type: "Point",
          },
        },
      };
    }

    if (category) {
      variables.where.category = { _eq: category.toUpperCase() };
    }

    if (country) {
      variables.where.country = { _eq: country };
    }

    if (name) {
      variables.where._or = [
        { name: { _ilike: `%${name}%` } },
        { city: { _ilike: `%${name}%` } },
        { address: { _ilike: `%${name}%` } },
      ];
    }
  }

  return { variables };
};

const GET_AVAILABLE_COUNTRIES = gql`
  query GetAvailableCountries($where: venues_bool_exp!) {
    venues(where: $where, distinct_on: country, order_by: { country: asc }) {
      country
    }
  }
`;

const GET_PUBLIC_VENUES = gql`
  query GetPublicVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
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
      slug
      status
      owner_id
      user_id
    }
    venues_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

const GET_USER_VENUES = gql`
  query GetUserVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      id
      name
      address
      city
      country
      postcode
      logo
      images
      category
      created_at
      description_uk
      description_en
      geo
      emails
      website
      phone_numbers
      social_links
      status
      owner_id
      slug
    }
    venues_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

const GET_ADMIN_VENUES = gql`
  query GetAdminVenues($where: venues_bool_exp!) {
    venues(where: $where, order_by: { updated_at: desc }) {
      id
      name
      address
      images
      category
      created_at
      description_uk
      description_en
      geo
      emails
      website
      phone_numbers
      status
      user_id
      slug
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

export const useVenues = () => {
  const [updateStatus, { error, loading }] = useMutation(UPDATE_VENUE_STATUS, {
    awaitRefetchQueries: true,
    refetchQueries: ["GetAdminVenues"],
  });

  const updateVenueStatus = useCallback(
    async (id: number, status: Venue_Category_Enum) => {
      const { data } = await updateStatus({
        variables: { id, status },
      });

      return { data, error, loading };
    },
    [updateStatus, loading, error],
  );

  /**
   * Get list of distinct countries where active venues exist.
   * Useful for populating country filter dropdowns.
   */
  const useAvailableCountries = () => {
    const { data, error, loading } = useQuery(GET_AVAILABLE_COUNTRIES, {
      variables: {
        where: {
          _and: [
            { status: { _eq: "ACTIVE" } },
            { country: { _is_null: false } },
            { country: { _neq: "" } }, // Exclude empty strings
          ],
        },
      },
    });

    const countries = data?.venues?.map((venue: { country: string }) => venue.country).filter(Boolean) ?? [];

    return {
      countries,
      error,
      loading,
    };
  };

  const useAdminVenues = (params: APIParams) => useGraphApi<GetAdminVenuesQuery["venues"]>(GET_ADMIN_VENUES, params);

  const useUserVenues = (params?: APIParams) => {
    const { data } = useSession();

    return useGraphApi<GetUserVenuesQuery["venues"]>(
      GET_USER_VENUES,
      {
        ...params,
        where: {
          _and: [{ user_id: { _eq: data?.user.id } }, ...(params?.where ? [params.where] : [])],
        },
      },
      {
        pause: !data?.user.id,
      },
    );
  };

  const usePublicVenues = (params: APIParams) => {
    return useGraphApi<GetPublicVenuesQuery["venues"]>(GET_PUBLIC_VENUES, params);
  };

  const useGetVenue = (slug?: string) =>
    useGraphApi<GetUserVenuesQuery["venues"]>(
      GET_USER_VENUES,
      {
        limit: 1,
        where: {
          slug: { _eq: slug },
        },
      },
      { skip: !slug },
    );

  return {
    updateVenueStatus,
    useAdminVenues,
    useAvailableCountries,
    useGetVenue,
    usePublicVenues,
    useUserVenues,
  };
};
