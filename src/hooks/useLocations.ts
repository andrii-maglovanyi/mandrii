import { DocumentNode, gql, useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import {
  GetAdminLocationsQuery,
  GetPublicLocationsQuery,
  GetUserLocationsQuery,
  Location_Category_Enum,
} from "~/types";

interface LocationsParams {
  category?: Location_Category_Enum;
  distance?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  slug?: string;
}

const getFilter = ({ category, distance, geo, slug }: LocationsParams) => {
  const variables: { where: Record<string, unknown> } = {
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
          distance: distance,
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
  }

  return { variables };
};

const GET_PUBLIC_LOCATIONS = gql`
  query GetPublicLocations($where: locations_bool_exp!) {
    locations(where: $where) {
      __typename
      id
      name
      address
      image_urls
      description_uk
      description_en
      geo
      emails
      website
      phone_numbers
      slug
      status
    }
    locations_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const GET_USER_LOCATIONS = gql`
  query GetUserLocations($where: locations_bool_exp!) {
    locations(where: $where, order_by: { updated_at: desc }) {
      id
      name
      address
      image_urls
      category
      created_at
      description_uk
      description_en
      geo
      emails
      website
      phone_numbers
      status
      slug
    }
    locations_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const GET_ADMIN_LOCATIONS = gql`
  query GetAdminLocations($where: locations_bool_exp!) {
    locations(where: $where, order_by: { updated_at: desc }) {
      id
      name
      address
      image_urls
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
    locations_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const UPDATE_LOCATION_STATUS = gql`
  mutation UpdateLocationStatus($id: uuid!, $status: location_status_enum!) {
    update_locations_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
      updated_at
    }
  }
`;

const useLocationsQuery = <T extends GetAdminLocationsQuery | GetPublicLocationsQuery | GetUserLocationsQuery>(
  query: DocumentNode,
  params: LocationsParams,
) => {
  const variables = useMemo(() => getFilter(params).variables, [params]);
  const { data, error, loading } = useQuery<T>(query, { variables });

  return {
    data: (data?.locations ?? []) as T["locations"],
    error,
    loading,
    total: data?.locations_aggregate?.aggregate?.count ?? 0,
  };
};

export const useLocations = () => {
  const [updateStatus, { error, loading }] = useMutation(UPDATE_LOCATION_STATUS);

  const updateLocationStatus = useCallback(
    async (id: number, status: Location_Category_Enum) => {
      const { data } = await updateStatus({
        variables: { id, status },
      });

      return { data, error, loading };
    },
    [updateStatus, loading, error],
  );

  const useAdminLocations = (params: LocationsParams) =>
    useLocationsQuery<GetAdminLocationsQuery>(GET_ADMIN_LOCATIONS, params);

  const useUserLocations = (params: LocationsParams) =>
    useLocationsQuery<GetUserLocationsQuery>(GET_USER_LOCATIONS, params);

  const usePublicLocations = (params: LocationsParams) =>
    useLocationsQuery<GetPublicLocationsQuery>(GET_PUBLIC_LOCATIONS, params);

  return {
    updateLocationStatus,
    useAdminLocations,
    usePublicLocations,
    useUserLocations,
  };
};
