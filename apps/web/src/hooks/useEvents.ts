import { gql } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

import { EVENT_FIELDS_FRAGMENT, GET_PUBLIC_EVENTS } from "~/graphql/events";
import { getDiscoverableEventsWhere, getPubliclyViewableEventsWhere } from "~/lib/content-visibility";
import { APIParams, Event_Status_Enum, FilterParams, GetPublicEventsQuery, GetUserEventsQuery } from "~/types";
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

  const usePublicEvents = (
    params: APIParams,
    options?: { includeTotal?: boolean; skip?: boolean; visibility?: "discoverable" | "public" },
  ) => {
    const { includeTotal = false, skip = false, visibility = "discoverable" } = options ?? {};
    const mergedParams = useMemo(
      () => ({
        ...params,
        includeTotal,
        order_by: params.order_by ?? [{ start_date: "asc" }],
        totalWhere: visibility === "public" ? getPubliclyViewableEventsWhere() : getDiscoverableEventsWhere(),
        where:
          visibility === "public"
            ? getPubliclyViewableEventsWhere(params.where)
            : getDiscoverableEventsWhere(params.where),
      }),
      [includeTotal, params, visibility],
    );

    const result = useGraphApi<GetPublicEventsQuery["events"]>(GET_PUBLIC_EVENTS, mergedParams, { skip });

    return result;
  };

  const usePublicEvent = (slug?: string) => {
    const queryParams = useMemo(
      () => ({
        limit: 1,
        totalWhere: getDiscoverableEventsWhere(),
        where: getPubliclyViewableEventsWhere({ slug: { _eq: slug } }),
      }),
      [slug],
    );

    const result = useGraphApi<GetPublicEventsQuery["events"]>(GET_PUBLIC_EVENTS, queryParams, { skip: !slug });

    const transformedData = useMemo(() => (result.data?.[0] ? result.data[0] : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const useEditableEvent = (slug?: string) => {
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";
    const queryParams = useMemo(
      () => ({
        limit: 1,
        where: {
          _and: [{ slug: { _eq: slug } }, ...(isAdmin ? [] : [{ user_id: { _eq: session?.user.id } }])],
        } as FilterParams,
      }),
      [isAdmin, session?.user.id, slug],
    );

    const result = useGraphApi<GetUserEventsQuery["events"]>(GET_USER_EVENTS, queryParams, {
      skip: !session?.user.id || !slug,
    });

    const transformedData = useMemo(() => (result.data?.[0] ? result.data[0] : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const useOwnedEvent = (slug?: string) => {
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";
    const queryParams = useMemo(
      () => ({
        limit: 1,
        where: {
          _and: [{ slug: { _eq: slug } }, ...(isAdmin ? [] : [{ owner_id: { _eq: session?.user.id } }])],
        } as FilterParams,
      }),
      [isAdmin, session?.user.id, slug],
    );

    const result = useGraphApi<GetUserEventsQuery["events"]>(GET_USER_EVENTS, queryParams, {
      skip: !session?.user.id || !slug,
    });

    const transformedData = useMemo(() => (result.data?.[0] ? result.data[0] : undefined), [result.data]);

    return {
      ...result,
      data: transformedData,
    };
  };

  const useUserEvents = (params?: APIParams, ownedOnly = false) => {
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";
    const shouldScopeToUser = ownedOnly || !isAdmin;
    const ownershipField = ownedOnly ? "owner_id" : "user_id";

    const mergedParams = useMemo(
      () => ({
        ...params,
        order_by: params?.order_by ?? [{ updated_at: "desc" }],
        where: {
          _and: [
            ...(shouldScopeToUser ? [{ [ownershipField]: { _eq: session?.user.id } }] : []),
            ...(params?.where ? [params.where] : []),
          ],
        },
      }),
      [ownershipField, params, session?.user.id, shouldScopeToUser],
    );

    const result = useGraphApi<GetUserEventsQuery["events"]>(GET_USER_EVENTS, mergedParams, {
      skip: !session?.user.id,
    });

    return result;
  };

  return {
    updateEventStatus,
    useEditableEvent,
    useOwnedEvent,
    usePublicEvent,
    usePublicEvents,
    useUserEvents,
  };
};
