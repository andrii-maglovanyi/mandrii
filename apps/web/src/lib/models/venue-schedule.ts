import { AuthenticatedSession } from "~/lib/api/context";
import { InternalServerError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Venue_Schedule } from "~/types";

const UPSERT_SCHEDULES_MUTATION = `
  mutation UpsertVenueSchedules(
    $venue_id: uuid!,
    $objects: [venue_schedule_insert_input!]! 
  ) {
    delete_venue_schedule(where: { venue_id: { _eq: $venue_id } }) {
      affected_rows
    }
    insert_venue_schedule(
      objects: $objects,
      on_conflict: {
        constraint: venue_schedule_venue_id_day_of_week_key
        update_columns: [open_time, close_time]
      }
    ) {
      affected_rows
    }
  }
`;

export const upsertVenueSchedules = async (
  venueId: string,
  schedules: Array<Partial<Venue_Schedule>>,
  session: AuthenticatedSession,
) => {
  const objects = schedules.map((s) => ({
    ...s,
    venue_id: venueId,
  }));

  const result = await executeGraphQLQuery<{ insert_venue_schedule: { affected_rows: number } | null }>(
    UPSERT_SCHEDULES_MUTATION,
    { objects, venue_id: venueId },
    {
      Authorization: `Bearer ${session.accessToken}`,
    },
  );

  if (!result.insert_venue_schedule) {
    throw new InternalServerError("Failed to upsert venue schedules");
  }

  return result.insert_venue_schedule.affected_rows;
};
