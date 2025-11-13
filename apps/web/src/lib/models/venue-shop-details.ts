import { AuthenticatedSession } from "~/lib/api/context";
import { InternalServerError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Venue_Shop_Details } from "~/types";

const UPSERT_SCHOOL_DETAILS_MUTATION = `
  mutation UpsertVenueShopDetails(
    $object: venue_shop_details_insert_input!
  ) {
    insert_venue_shop_details_one(
      object: $object,
      on_conflict: {
        constraint: venue_shop_details_pkey,
        update_columns: [
          product_categories
          payment_methods
        ]
      }
    ) {
      venue_id
  }
  }
`;

export const upsertVenueShopDetails = async (
  venueId: string,
  object: Partial<Venue_Shop_Details>,
  session: AuthenticatedSession,
) => {
  const result = await executeGraphQLQuery<{
    insert_venue_shop_details_one: { venue_id: string } | null;
  }>(
    UPSERT_SCHOOL_DETAILS_MUTATION,
    { object: { ...object, venue_id: venueId } },
    {
      Authorization: `Bearer ${session.accessToken}`,
    },
  );

  if (!result.insert_venue_shop_details_one) {
    throw new InternalServerError("Failed to upsert venue shop details");
  }

  return result.insert_venue_shop_details_one;
};
