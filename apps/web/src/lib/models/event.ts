import { AuthenticatedSession } from "~/lib/api/context";
import { BadRequestError, InternalServerError, NotFoundError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { invalidatePublicContent } from "~/lib/public-cache/invalidate";
import { Events } from "~/types";

const INSERT_EVENT_MUTATION = `
  mutation InsertEvent($object: events_insert_input!) {
    insert_events_one(object: $object) {
      id
    }
  }
`;

const UPDATE_EVENT_MUTATION = `
  mutation UpdateEvent($id: uuid!, $_set: events_set_input!) {
    update_events_by_pk(pk_columns: { id: $id }, _set: $_set) {
      id
    }
  }
`;

export const saveEvent = async (variables: Partial<Events>, session: AuthenticatedSession) => {
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

    const result = await executeGraphQLQuery<{ update_events_by_pk: { id: string } | null }>(
      UPDATE_EVENT_MUTATION,
      {
        _set: cleanedFields,
        id,
      },
      { Authorization: `Bearer ${session.accessToken}` },
    );

    if (!result.update_events_by_pk) {
      throw new NotFoundError("Event not found");
    }

    invalidatePublicContent();
    return result.update_events_by_pk.id;
  } else {
    const result = await executeGraphQLQuery<{ insert_events_one: { id: string } | null }>(
      INSERT_EVENT_MUTATION,
      {
        object: { ...variables, user_id: session.user.id },
      },
      { Authorization: `Bearer ${session.accessToken}` },
    );

    if (!result.insert_events_one) {
      throw new InternalServerError("Failed to create event - no data returned from database");
    }

    invalidatePublicContent();
    return result.insert_events_one.id;
  }
};
