import { AuthenticatedSession } from "~/lib/api/context";
import { InternalServerError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Venue_School_Details } from "~/types";

const UPSERT_SCHOOL_DETAILS_MUTATION = `
  mutation UpsertVenueSchoolDetails(
    $object: venue_school_details_insert_input!
  ) {
    insert_venue_school_details_one(
      object: $object,
      on_conflict: {
        constraint: venue_school_details_pkey,
        update_columns: [
          age_groups,
          languages_taught,
          subjects,
          class_size_max,
          online_classes_available
        ]
      }
    ) {
      venue_id
    }
  }
`;

export const upsertVenueSchoolDetails = async (
  venueId: string,
  object: Partial<Venue_School_Details>,
  session: AuthenticatedSession,
) => {
  const result = await executeGraphQLQuery<{
    insert_venue_school_details_one: { venue_id: string } | null;
  }>(
    UPSERT_SCHOOL_DETAILS_MUTATION,
    { object: { ...object, venue_id: venueId } },
    {
      Authorization: `Bearer ${session.accessToken}`,
    },
  );

  if (!result.insert_venue_school_details_one) {
    throw new InternalServerError("Failed to upsert venue school details");
  }

  return result.insert_venue_school_details_one;
};
