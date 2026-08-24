import { gql } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

import { EVENT_FIELDS_FRAGMENT, GET_PUBLIC_EVENTS } from "~/graphql/events";
import { APIParams, Event_Status_Enum, GetPublicEventsQuery, GetUserEventsQuery } from "~/types";
import { UUID } from "~/types/uuid";

import { useGraphApi } from "./useGraphApi";

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

export const useEvents = () => {
  const updateEventStatus = useCallback(async (id: UUID, status: Event_Status_Enum) => {
    const response = await fetch("/api/content/status", {
      body: JSON.stringify({ id, status, type: "event" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = (await response.json()) as { content?: { id: UUID; status: Event_Status_Enum }; error?: string };

    if (!response.ok || !result.content) {
      throw new Error(result.error ?? "Unable to update event status");
    }

    return result.content;
  }, []);

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
