"use client";

import { useQuery } from "@apollo/client";
import { useMemo, useState } from "react";

import { GET_PUBLIC_EVENT_SCHEDULES, GET_PUBLIC_EVENTS } from "~/graphql/events";
import { getDiscoverableEventsWhere, getPubliclyViewableEventsWhere } from "~/lib/content-visibility";
import { EventSchedule, EventWindow, orderEventsByIds, selectEventSchedules } from "~/lib/events/discovery";
import { FilterParams, GetPublicEventsQuery } from "~/types";

type DiscoveryOptions = {
  limit: number;
  offset?: number;
  skip?: boolean;
  where?: FilterParams;
} & EventWindow;

const EMPTY_SCHEDULES: EventSchedule[] = [];
const EMPTY_EVENTS: GetPublicEventsQuery["events"] = [];

/** Page through schedules first; fetch rich content only for visible cards. */
export function useEventDiscovery({
  from,
  includePast = false,
  limit,
  offset = 0,
  skip = false,
  to,
  where,
}: DiscoveryOptions) {
  const [now] = useState(() => new Date());
  const publicWhere = useMemo(
    () => (includePast ? getPubliclyViewableEventsWhere(where) : getDiscoverableEventsWhere(where)),
    [includePast, where],
  );
  const schedules = useQuery<{ events: EventSchedule[] }>(GET_PUBLIC_EVENT_SCHEDULES, {
    fetchPolicy: "cache-and-network",
    skip,
    variables: { where: publicWhere },
  });
  const scheduleData = useLastSuccessfulData(schedules.data, JSON.stringify(publicWhere));
  const candidates = scheduleData?.events ?? EMPTY_SCHEDULES;
  const matching = useMemo(
    () => selectEventSchedules(candidates, { from, includePast, to }, now),
    [candidates, from, to, includePast, now],
  );
  const ids = useMemo(() => matching.slice(offset, offset + limit).map(({ id }) => id), [matching, offset, limit]);
  const details = useQuery<GetPublicEventsQuery>(GET_PUBLIC_EVENTS, {
    fetchPolicy: "cache-and-network",
    skip: skip || !scheduleData || ids.length === 0,
    variables: {
      limit: ids.length,
      totalWhere: getDiscoverableEventsWhere(),
      where: { _and: [publicWhere, { id: { _in: ids } }] },
    },
  });
  const detailData = useLastSuccessfulData(details.data, JSON.stringify([publicWhere, ids]));
  const data = useMemo(() => orderEventsByIds(detailData?.events ?? EMPTY_EVENTS, ids), [detailData, ids]);
  const hasCachedResults = Boolean(scheduleData) && (ids.length === 0 || Boolean(detailData));
  const refreshError = schedules.error ?? details.error;
  return {
    count: matching.length,
    data: skip || ids.length === 0 ? EMPTY_EVENTS : data,
    error: hasCachedResults ? undefined : refreshError,
    loading: !skip && ((!scheduleData && schedules.loading) || (ids.length > 0 && details.loading && !detailData)),
    refreshError: hasCachedResults ? refreshError : undefined,
  };
}

/** Keep successful data through a failed background refresh, scoped to exact filters. */
function useLastSuccessfulData<T>(data: T | undefined, key: string): T | undefined {
  const [last, setLast] = useState<{ data: T; key: string } | null>(null);
  if (data !== undefined && (last?.data !== data || last.key !== key)) setLast({ data, key });
  return data ?? (last?.key === key ? last.data : undefined);
}
