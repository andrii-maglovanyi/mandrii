import { AuthenticatedSession } from "~/lib/api/context";
import { InternalServerError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Venue_Restaurant_Details } from "~/types";

const UPSERT_RESTAURANT_DETAILS_MUTATION = `
  mutation UpsertVenueRestaurantDetails(
    $object: venue_restaurant_details_insert_input!
  ) {
    insert_venue_restaurant_details_one(
      object: $object,
      on_conflict: {
        constraint: venue_restaurant_details_pkey,
        update_columns: [
          cuisine_types,
          seating_capacity,
          price_range,
          features
        ]
      }
    ) {
      venue_id
    }
  }
`;

export const upsertVenueRestaurantDetails = async (
  venueId: string,
  object: Partial<Venue_Restaurant_Details>,
  session: AuthenticatedSession,
) => {
  const result = await executeGraphQLQuery<{
    insert_venue_restaurant_details_one: { venue_id: string } | null;
  }>(
    UPSERT_RESTAURANT_DETAILS_MUTATION,
    { object: { ...object, venue_id: venueId } },
    {
      Authorization: `Bearer ${session.accessToken}`,
    },
  );

  if (!result.insert_venue_restaurant_details_one) {
    throw new InternalServerError("Failed to upsert venue restaurant details");
  }

  return result.insert_venue_restaurant_details_one;
};
