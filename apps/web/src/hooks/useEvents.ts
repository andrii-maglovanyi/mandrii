import { gql, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

import { EVENT_FIELDS_FRAGMENT, GET_PUBLIC_EVENTS } from "~/graphql/events";
import { APIParams, Event_Status_Enum, GetPublicEventsQuery, GetUserEventsQuery } from "~/types";
import { UUID } from "~/types/uuid";

import { useGraphApi } from "./useGraphApi";

const now = new Date().toISOString();

const GET_USER_EVENTS = gql`
  ${EVENT_FIELDS_FRAGMENT}
  query GetUserEvents($where: events_bool_exp!, $limit: Int, $offset: Int, $order_by: [events_order_by!]) {
    events(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...EventFields
      updated_at
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
        whereTotal: {
          _or: [{ start_date: { _gte: now } }, { end_date: { _gte: now } }],
        },
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
