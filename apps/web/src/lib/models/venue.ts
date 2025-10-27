import { AuthenticatedSession } from "~/lib/api/context";
import { BadGateway, BadRequestError, InternalServerError, NotFoundError } from "~/lib/api/errors";
import { publicConfig } from "~/lib/config/public";
import { Venues } from "~/types";

const VENUE_FIELDS = `
  id
  name
  address
  phone_numbers
  emails
  category
  city
  country
  postcode
  geo
  images
  logo
  description_en
  description_uk
  website
  social_links
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

const executeGraphQLQuery = async <T>(
  query: string,
  variables: Record<string, unknown>,
  accessToken: string,
): Promise<T> => {
  const response = await fetch(publicConfig.hasura.endpoint, {
    body: JSON.stringify({ query, variables }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new BadGateway("Failed to save venue");
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

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

    const result = await executeGraphQLQuery<{ update_venues_by_pk: { id: string } }>(
      UPDATE_VENUE_MUTATION,
      {
        _set: cleanedFields,
        id,
      },
      session.accessToken,
    );

    if (!result.update_venues_by_pk) {
      throw new NotFoundError("Venue not found");
    }

    return result.update_venues_by_pk.id;
  } else {
    const result = await executeGraphQLQuery<{ insert_venues_one: { id: string } }>(
      INSERT_VENUE_MUTATION,
      {
        object: { ...variables, owner_id: isOwner ? session.user.id : null, user_id: session.user.id },
      },
      session.accessToken,
    );

    if (!result.insert_venues_one) {
      throw new InternalServerError("Failed to create venue");
    }

    return result.insert_venues_one.id;
  }
};
