import { gql, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

import { EVENT_FIELDS_FRAGMENT, GET_PUBLIC_EVENTS } from "~/graphql/events";
import {
  APIParams,
  Event_Status_Enum,
  Event_Type_Enum,
  FilterParams,
  GetPublicEventsQuery,
  GetUserEventsQuery,
  Price_Type_Enum,
} from "~/types";
import { UUID } from "~/types/uuid";

import { useGraphApi } from "./useGraphApi";

interface EventsParams {
  dateFrom?: string;
  dateTo?: string;
  distance?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  isOnline?: boolean;
  name?: string;
  priceType?: Price_Type_Enum;
  slug?: string;
  type?: Event_Type_Enum;
}

export const getEventsFilter = ({
  dateFrom,
  dateTo,
  distance,
  geo,
  isOnline,
  name,
  priceType,
  slug,
  type,
}: EventsParams) => {
  const where: FilterParams = {};

  if (slug) {
    where.slug = { _eq: slug };
    return { variables: { where } };
  }

  if (isOnline !== undefined) {
    where.is_online = { _eq: isOnline };
  }

  if (type) {
    where.type = { _eq: type };
  }

  if (priceType) {
    where.price_type = { _eq: priceType };
  }

  // Date range filter - only show upcoming/ongoing events
  const now = new Date().toISOString();
  if (dateFrom) {
    where.start_date = { _gte: dateFrom };
  } else {
    // By default, only show future events
    where.end_date = { _gte: now };
  }

  if (dateTo) {
    where.start_date = { ...where.start_date, _lte: dateTo };
  }

  if (geo && isOnline !== true) {
    const geoFilter = {
      _st_d_within: {
        distance: distance || "100000", // default to 100km if distance not provided
        from: {
          coordinates: [geo.lng, geo.lat] as [number, number],
          type: "Point" as const,
        },
      },
    };

    where._and = [
      {
        _or: [{ geo: geoFilter }, { venue: { geo: geoFilter } }],
      },
    ];
  }

  if (name) {
    where._or = [
      { title_en: { _ilike: `%${name}%` } },
      { title_uk: { _ilike: `%${name}%` } },
      { description_en: { _ilike: `%${name}%` } },
      { description_uk: { _ilike: `%${name}%` } },
      { area: { _ilike: `%${name}%` } },
      { city: { _ilike: `%${name}%` } },
      { custom_location_address: { _ilike: `%${name}%` } },
      { venue: { name: { _ilike: `%${name}%` } } },
    ];
  }

  return { variables: { where } };
};

const GET_USER_EVENTS = gql`
  ${EVENT_FIELDS_FRAGMENT}
  query GetUserEvents($where: events_bool_exp!, $limit: Int, $offset: Int, $order_by: [events_order_by!]) {
    events(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...EventFields
      updated_at
      owner {
        id
        name
        image
      }
    }
    events_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

const UPDATE_EVENT_STATUS = gql`
  mutation UpdateEventStatus($id: uuid!, $status: event_status_enum!) {
    update_events_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
      updated_at
    }
  }
`;

export const useEvents = () => {
  const [updateStatus, { error, loading }] = useMutation(UPDATE_EVENT_STATUS, {
    awaitRefetchQueries: true,
    refetchQueries: ["GetUserEvents"],
  });

  const updateEventStatus = useCallback(
    async (id: UUID, status: Event_Status_Enum) => {
      const { data } = await updateStatus({
        variables: { id, status },
      });

      return { data, error, loading };
    },
    [updateStatus, loading, error],
  );

  const usePublicEvents = (params: APIParams) => {
    const mergedParams = useMemo(
      () => ({
        ...params,
        order_by: params.order_by ?? [{ start_date: "asc" }],
      }),
      [params],
    );

    const result = useGraphApi<GetPublicEventsQuery["events"]>(GET_PUBLIC_EVENTS, mergedParams);

    return result;
  };

  const useGetEvent = (slug?: string) => {
    const queryParams = useMemo(
      () => ({
        limit: 1,
        where: {
          slug: { _eq: slug },
        },
      }),
      [slug],
    );

    const result = useGraphApi<GetPublicEventsQuery["events"]>(GET_USER_EVENTS, queryParams, { skip: !slug });

    const transformedData = useMemo(() => (result.data?.[0] ? result.data[0] : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const useUserEvents = (params?: APIParams) => {
    const { data: session } = useSession();

    const mergedParams = useMemo(
      () => ({
        ...params,
        order_by: params?.order_by ?? [{ updated_at: "desc" }],
        where: {
          _and: [{ user_id: { _eq: session?.user.id } }, ...(params?.where ? [params.where] : [])],
        },
      }),
      [params, session?.user.id],
    );

    const result = useGraphApi<GetUserEventsQuery["events"]>(GET_USER_EVENTS, mergedParams, {
      pause: !session?.user.id,
    });

    return result;
  };

  return {
    updateEventStatus,
    useGetEvent,
    usePublicEvents,
    useUserEvents,
  };
};
