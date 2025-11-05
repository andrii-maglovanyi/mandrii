import { AuthenticatedSession } from "~/lib/api/context";
import { BadGateway, BadRequestError, InternalServerError, NotFoundError } from "~/lib/api/errors";
import { publicConfig } from "~/lib/config/public";
import { Events } from "~/types";

const EVENT_FIELDS = `
  id
  title
  slug
  description_en
  description_uk
  type
  price_type
  price_amount
  price_currency
  start_date
  end_date
  is_online
  external_url
  custom_location_address
  custom_location_name
  city
  country
  geo
  images
  registration_url
  registration_required
  capacity
  age_restriction
  language
  accessibility_info
  social_links
  status
  created_at
  updated_at
  is_recurring
  recurrence_rule
  organizer_name
  organizer_phone_number
  organizer_email
  owner_id
  venue_id
  user_id
`;

const INSERT_EVENT_MUTATION = `
  mutation InsertEvent($object: events_insert_input!) {
    insert_events_one(object: $object) {
      ${EVENT_FIELDS}
    }
  }
`;

const UPDATE_EVENT_MUTATION = `
  mutation UpdateEvent($id: uuid!, $_set: events_set_input!) {
    update_events_by_pk(pk_columns: { id: $id }, _set: $_set) {
      ${EVENT_FIELDS}
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
    throw new BadGateway("Failed to save event");
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

export const saveEvent = async (variables: Partial<Events>, session: AuthenticatedSession, isOwner = false) => {
  const isUpdate = !!variables.id;

  if (isUpdate) {
    const { id, ...updateFields } = variables;

    if (!id) {
      throw new BadRequestError("Event ID is required for updates");
    }

    const cleanedFields = Object.fromEntries(Object.entries(updateFields).filter(([, v]) => v !== undefined));

    if (Object.keys(cleanedFields).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    const result = await executeGraphQLQuery<{ update_events_by_pk: { id: string } }>(
      UPDATE_EVENT_MUTATION,
      {
        _set: cleanedFields,
        id,
      },
      session.accessToken,
    );

    if (!result.update_events_by_pk) {
      throw new NotFoundError("Event not found");
    }

    return result.update_events_by_pk.id;
  } else {
    const result = await executeGraphQLQuery<{ insert_events_one: { id: string } }>(
      INSERT_EVENT_MUTATION,
      {
        object: { ...variables, owner_id: isOwner ? session.user.id : null, user_id: session.user.id },
      },
      session.accessToken,
    );

    if (!result.insert_events_one) {
      throw new InternalServerError("Failed to create event");
    }

    return result.insert_events_one.id;
  }
};
