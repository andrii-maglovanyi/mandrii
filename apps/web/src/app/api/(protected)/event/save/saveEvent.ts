import { AuthenticatedSession } from "~/lib/api/context";
import { BadGateway, BadRequestError, InternalServerError, NotFoundError } from "~/lib/api/errors";
import { publicConfig } from "~/lib/config/public";
import { UUID } from "~/types/uuid";

/**
 * Event data structure for database operations.
 */
interface EventData {
  id?: UUID;
  title: string;
  slug?: string;
  description_en?: string | null;
  description_uk?: string | null;
  start_date: Date | string;
  end_date?: Date | string | null;
  event_type: string;
  venue_id?: UUID | null;
  custom_location_name?: string | null;
  custom_location_address?: string | null;
  geo?: { type: "Point"; coordinates: [number, number] } | null;
  city?: string | null;
  country?: string | null;
  is_online: boolean;
  image: string;
  images: string[];
  organizer_name: string;
  organizer_contact?: string | null;
  price_type: string;
  price_amount?: number | null;
  price_currency: string;
  registration_url?: string | null;
  registration_required: boolean;
  external_url?: string | null;
  social_links: Record<string, string | null>;
  language?: string[] | null;
  capacity?: number | null;
  age_restriction?: string | null;
  accessibility_info?: string | null;
  is_recurring: boolean;
  recurrence_rule?: string | null;
  status?: string;
  owner_id: UUID;
}

const EVENT_FIELDS = `
  id
  title
  slug
  description_en
  description_uk
  start_date
  end_date
  event_type
  venue_id
  custom_location_name
  custom_location_address
  geo
  city
  country
  is_online
  image
  images
  organizer_name
  organizer_contact
  price_type
  price_amount
  price_currency
  registration_url
  registration_required
  external_url
  social_links
  language
  capacity
  age_restriction
  accessibility_info
  is_recurring
  recurrence_rule
  status
  owner_id
  user_id
  created_at
  updated_at
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

const INSERT_EVENT_TAGS_MUTATION = `
  mutation InsertEventTags($objects: [events_event_tags_insert_input!]!) {
    insert_events_event_tags(objects: $objects, on_conflict: { constraint: events_event_tags_pkey, update_columns: [] }) {
      affected_rows
    }
  }
`;

const DELETE_EVENT_TAGS_MUTATION = `
  mutation DeleteEventTags($event_id: uuid!) {
    delete_events_event_tags(where: { event_id: { _eq: $event_id } }) {
      affected_rows
    }
  }
`;

/**
 * Execute a GraphQL query/mutation.
 *
 * @param query - GraphQL query string.
 * @param variables - Query variables.
 * @param accessToken - User access token.
 * @returns Query result data.
 */
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

/**
 * Save event to database (create or update) and handle event tags.
 *
 * @param eventData - Event data to save.
 * @param eventTags - Array of event tag UUIDs.
 * @param session - Authenticated user session.
 * @returns The ID of the saved event.
 */
export const saveEvent = async (
  eventData: Partial<EventData>,
  eventTags: string[],
  session: AuthenticatedSession,
): Promise<string> => {
  const isUpdate = !!eventData.id;

  let eventId: string;

  if (isUpdate) {
    const { id, ...updateFields } = eventData;

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

    eventId = result.update_events_by_pk.id;

    // Delete existing event tags
    await executeGraphQLQuery(
      DELETE_EVENT_TAGS_MUTATION,
      { event_id: eventId },
      session.accessToken,
    );
  } else {
    const result = await executeGraphQLQuery<{ insert_events_one: { id: string } }>(
      INSERT_EVENT_MUTATION,
      {
        object: {
          ...eventData,
          user_id: session.user.id,
        },
      },
      session.accessToken,
    );

    if (!result.insert_events_one) {
      throw new InternalServerError("Failed to create event");
    }

    eventId = result.insert_events_one.id;
  }

  // Insert event tags if provided
  if (eventTags.length > 0) {
    const tagObjects = eventTags.map((tag_id) => ({
      event_id: eventId,
      event_tag_id: tag_id,
    }));

    await executeGraphQLQuery(
      INSERT_EVENT_TAGS_MUTATION,
      { objects: tagObjects },
      session.accessToken,
    );
  }

  return eventId;
};
