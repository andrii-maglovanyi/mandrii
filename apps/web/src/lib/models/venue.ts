import { AuthenticatedSession } from "~/lib/api/context";
import { BadRequestError, InternalServerError, NotFoundError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Venues } from "~/types";

const VENUE_FIELDS = `
  id
  name
  address
  phone_numbers
  emails
  category
  city
  area
  country
  postcode
  geo
  images
  logo
  description_en
  description_uk
  website
  social_links
  venue_schedules {
    day_of_week
    open_time
    close_time
  }
  slug
  status
`;

const INSERT_VENUE_MUTATION = `
  mutation InsertVenue($object: venues_insert_input!) {
    insert_venues_one(object: $object) {
      ${VENUE_FIELDS}
    }
  }
`;

const UPDATE_VENUE_MUTATION = `
  mutation UpdateVenue($id: uuid!, $_set: venues_set_input!) {
    update_venues_by_pk(pk_columns: { id: $id }, _set: $_set) {
      ${VENUE_FIELDS}
    }
  }
`;

export const saveVenue = async (variables: Partial<Venues>, session: AuthenticatedSession, isOwner = false) => {
  const isUpdate = !!variables.id;

  if (isUpdate) {
    const { id, ...updateFields } = variables;

    if (!id) {
      throw new BadRequestError("Venue ID is required for updates");
    }

    const cleanedFields = Object.fromEntries(Object.entries(updateFields).filter(([, v]) => v !== undefined));

    if (Object.keys(cleanedFields).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    const result = await executeGraphQLQuery<{ update_venues_by_pk: { id: string } | null }>(
      UPDATE_VENUE_MUTATION,
      {
        _set: cleanedFields,
        id,
      },
      { Authorization: `Bearer ${session.accessToken}` },
    );

    if (!result.update_venues_by_pk) {
      throw new NotFoundError("Venue not found");
    }

    return result.update_venues_by_pk.id;
  } else {
    const result = await executeGraphQLQuery<{ insert_venues_one: { id: string } | null }>(
      INSERT_VENUE_MUTATION,
      {
        object: { ...variables, owner_id: isOwner ? session.user.id : null, user_id: session.user.id },
      },
      { Authorization: `Bearer ${session.accessToken}` },
    );

    if (!result.insert_venues_one) {
      throw new InternalServerError("Failed to create venue - no data returned from database");
    }

    return result.insert_venues_one.id;
  }
};
