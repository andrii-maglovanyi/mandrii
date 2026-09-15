import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";

import { getEventsFilter } from "~/features/Events/utils/getEventsFilter";
import { GET_PUBLIC_VENUE_OPTIONS, GET_PUBLIC_VENUES, GET_USER_VENUES } from "~/graphql/venues";
import { getDiscoverableEventsWhere, getDiscoverableVenuesWhere } from "~/lib/content-visibility";
import { getVenueData } from "~/lib/venues/presentation";
import {
  APIParams,
  FilterParams,
  GetPublicVenuesQuery,
  GetUserVenuesQuery,
  Venue_Category_Enum,
  Venue_Status_Enum,
} from "~/types";
import { UUID } from "~/types/uuid";

import { useGraphApi } from "./useGraphApi";

export type PublicVenueOption = {
  city?: null | string;
  id: UUID;
  name: string;
};

interface VenuesParams {
  categories?: Venue_Category_Enum[];
  category?: Venue_Category_Enum;
  city?: string;
  country?: string;
  distance?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  name?: string;
  slug?: string;
}

export const getVenuesFilter = ({ categories, category, city, country, distance, geo, name, slug }: VenuesParams) => {
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

  if (categories?.length) {
    where.category = { _in: categories };
  } else if (category) {
    where.category = { _eq: category.toUpperCase() };
  }

  if (city) {
    where.city = { _ilike: `%${city}%` };
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

export const useVenues = () => {
  const updateVenueStatus = useCallback(async (id: UUID, status: Venue_Status_Enum) => {
    const response = await fetch("/api/content/status", {
      body: JSON.stringify({ id, status, type: "venue" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = (await response.json()) as { content?: { id: UUID; status: Venue_Status_Enum }; error?: string };

    if (!response.ok || !result.content) {
      throw new Error(result.error ?? "Unable to update venue status");
    }

    return result.content;
  }, []);

  const useUserVenues = (params?: APIParams, ownedOnly = false) => {
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";
    const shouldScopeToUser = ownedOnly || !isAdmin;
    const ownershipField = ownedOnly ? "owner_id" : "user_id";

    const mergedParams = useMemo(
      () => ({
        ...params,
        where: {
          _and: [
            ...(shouldScopeToUser ? [{ [ownershipField]: { _eq: session?.user.id } }] : []),
            ...(params?.where ? [params.where] : []),
          ],
        } as FilterParams,
      }),
      [ownershipField, params, session?.user.id, shouldScopeToUser],
    );

    const result = useGraphApi<GetUserVenuesQuery["venues"]>(GET_USER_VENUES, mergedParams, {
      skip: !session?.user.id,
    });

    const transformedData = useMemo(() => result.data?.map(getVenueData), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const usePublicVenues = (params: APIParams, options?: { includeTotal?: boolean; skip?: boolean }) => {
    const { includeTotal = false, skip = false } = options ?? {};
    const [whereEvents] = useState(() =>
      getDiscoverableEventsWhere(getEventsFilter({ dateFrom: new Date().toISOString() }).variables.where),
    );
    const mergedParams = useMemo(() => {
      return {
        ...params,
        includeTotal,
        totalWhere: getDiscoverableVenuesWhere(),
        where: getDiscoverableVenuesWhere(params.where),
        whereEvents,
      };
    }, [includeTotal, params, whereEvents]);

    const result = useGraphApi<GetPublicVenuesQuery["venues"]>(GET_PUBLIC_VENUES, mergedParams, { skip });

    const transformedData = useMemo(() => result.data?.map(getVenueData), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const usePublicVenue = (slug?: string) => {
    const queryParams = useMemo(
      () => ({
        includeCount: false,
        includeTotal: false,
        limit: 1,
        totalWhere: getDiscoverableVenuesWhere(),
        where: getDiscoverableVenuesWhere({ slug: { _eq: slug } }),
        whereEvents: getDiscoverableEventsWhere(
          getEventsFilter({ dateFrom: new Date().toISOString() }).variables.where,
        ),
      }),
      [slug],
    );

    const result = useGraphApi<GetPublicVenuesQuery["venues"]>(GET_PUBLIC_VENUES, queryParams, { skip: !slug });

    const transformedData = useMemo(() => (result.data?.[0] ? getVenueData(result.data[0]) : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const usePublicVenueOptions = (query = "", selectedId?: null | string) => {
    const queryParams = useMemo(
      () => ({
        limit: 20,
        order_by: [{ name: "asc" as const }],
        where: getDiscoverableVenuesWhere(
          query.trim() ? getVenuesFilter({ name: query.trim() }).variables.where : undefined,
        ),
      }),
      [query],
    );

    const result = useGraphApi<PublicVenueOption[]>(GET_PUBLIC_VENUE_OPTIONS, queryParams);
    const selectedParams = useMemo(
      () => ({
        limit: 1,
        where: getDiscoverableVenuesWhere({ id: { _eq: selectedId ?? undefined } }),
      }),
      [selectedId],
    );
    const selected = useGraphApi<PublicVenueOption[]>(GET_PUBLIC_VENUE_OPTIONS, selectedParams, { skip: !selectedId });
    const data = useMemo(() => {
      const selectedVenue = selected.data.find((venue) => venue.id === selectedId);
      return selectedVenue && !result.data.some((venue) => venue.id === selectedId)
        ? [selectedVenue, ...result.data]
        : result.data;
    }, [result.data, selected.data, selectedId]);

    return { ...result, data };
  };

  const useEditableVenue = (slug?: string) => {
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";
    const queryParams = useMemo(
      () => ({
        includeCount: false,
        limit: 1,
        where: {
          _and: [
            { slug: { _eq: slug } },
            ...(isAdmin
              ? []
              : [
                  {
                    _or: [
                      { owner_id: { _eq: session?.user.id } },
                      {
                        _and: [{ owner_id: { _is_null: true } }, { user_id: { _eq: session?.user.id } }],
                      },
                    ],
                  },
                ]),
          ],
        } as FilterParams,
      }),
      [isAdmin, session?.user.id, slug],
    );

    const result = useGraphApi<GetUserVenuesQuery["venues"]>(GET_USER_VENUES, queryParams, {
      skip: !session?.user.id || !slug,
    });

    const transformedData = useMemo(() => (result.data?.[0] ? result.data[0] : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const useOwnedVenue = (slug?: string) => {
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";
    const queryParams = useMemo(
      () => ({
        includeCount: false,
        limit: 1,
        where: {
          _and: [{ slug: { _eq: slug } }, ...(isAdmin ? [] : [{ owner_id: { _eq: session?.user.id } }])],
        } as FilterParams,
      }),
      [isAdmin, session?.user.id, slug],
    );

    const result = useGraphApi<GetUserVenuesQuery["venues"]>(GET_USER_VENUES, queryParams, {
      skip: !session?.user.id || !slug,
    });

    const transformedData = useMemo(() => (result.data?.[0] ? getVenueData(result.data[0]) : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  return {
    updateVenueStatus,
    useEditableVenue,
    useOwnedVenue,
    usePublicVenue,
    usePublicVenueOptions,
    usePublicVenues,
    useUserVenues,
  };
};
