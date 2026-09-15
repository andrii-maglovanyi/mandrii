import { Event_Status_Enum, FilterParams, Venue_Status_Enum } from "~/types";

const withRequiredFilter = (required: FilterParams, where?: FilterParams): FilterParams => ({
  _and: [required, ...(where ? [where] : [])],
});

/** Content that belongs in public discovery surfaces such as catalogues and maps. */
export const getDiscoverableEventsWhere = (where?: FilterParams) =>
  withRequiredFilter({ status: { _eq: Event_Status_Enum.Active } }, where);

/**
 * Detail pages remain available after an event has finished or been archived.
 * They are deliberately excluded from discovery surfaces above.
 */
export const getPubliclyViewableEventsWhere = (where?: FilterParams) =>
  withRequiredFilter(
    { status: { _in: [Event_Status_Enum.Active, Event_Status_Enum.Completed, Event_Status_Enum.Archived] } },
    where,
  );

/** Archived venues remain publicly available as reference entries, but never private submissions. */
export const getDiscoverableVenuesWhere = (where?: FilterParams) =>
  withRequiredFilter({ status: { _in: [Venue_Status_Enum.Active, Venue_Status_Enum.Archived] } }, where);
