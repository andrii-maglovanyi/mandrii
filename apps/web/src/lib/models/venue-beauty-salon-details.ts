import { AuthenticatedSession } from "~/lib/api/context";
import { InternalServerError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Venue_Beauty_Salon_Details } from "~/types";

const UPSERT_BEAUTY_SALON_DETAILS_MUTATION = `
  mutation UpsertVenueBeautySalonDetails(
    $object: venue_beauty_salon_details_insert_input!
  ) {
    insert_venue_beauty_salon_details_one(
      object: $object,
      on_conflict: {
        constraint: venue_beauty_salon_details_pkey,
        update_columns: [
          services,
          appointment_required,
          walk_ins_accepted
        ]
      }
    ) {
      venue_id
  }
  }
`;

export const upsertVenueBeautySalonDetails = async (
  venueId: string,
  object: Partial<Venue_Beauty_Salon_Details>,
  session: AuthenticatedSession,
) => {
  const result = await executeGraphQLQuery<{
    insert_venue_beauty_salon_details_one: { venue_id: string } | null;
  }>(
    UPSERT_BEAUTY_SALON_DETAILS_MUTATION,
    { object: { ...object, venue_id: venueId } },
    {
      Authorization: `Bearer ${session.accessToken}`,
    },
  );

  if (!result.insert_venue_beauty_salon_details_one) {
    throw new InternalServerError("Failed to upsert venue beauty salon details");
  }

  return result.insert_venue_beauty_salon_details_one;
};
