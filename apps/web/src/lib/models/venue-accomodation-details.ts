import { AuthenticatedSession } from "~/lib/api/context";
import { InternalServerError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Venue_Accommodation_Details } from "~/types";

const UPSERT_ACCOMMODATION_DETAILS_MUTATION = `
  mutation UpsertVenueAccommodationDetails(
    $object: venue_accommodation_details_insert_input!
  ) {
    insert_venue_accommodation_details_one(
      object: $object,
      on_conflict: {
        constraint: venue_accommodation_details_pkey,
        update_columns: [
          bedrooms,
          bathrooms,
          max_guests,
          amenities,
          check_in_time,
          check_out_time,
          minimum_stay_nights
        ]
      }
    ) {
      venue_id
    }
  }
`;

export const upsertVenueAccommodationDetails = async (
  venueId: string,
  object: Partial<Venue_Accommodation_Details>,
  session: AuthenticatedSession,
) => {
  const result = await executeGraphQLQuery<{
    insert_venue_accommodation_details_one: { venue_id: string } | null;
  }>(
    UPSERT_ACCOMMODATION_DETAILS_MUTATION,
    { object: { ...object, venue_id: venueId } },
    {
      Authorization: `Bearer ${session.accessToken}`,
    },
  );

  if (!result.insert_venue_accommodation_details_one) {
    throw new InternalServerError("Failed to upsert venue accommodation details");
  }

  return result.insert_venue_accommodation_details_one;
};
