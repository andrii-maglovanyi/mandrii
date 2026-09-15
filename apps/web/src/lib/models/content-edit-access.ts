import type { AuthenticatedSession } from "~/lib/api/context";

import { ForbiddenError, NotFoundError } from "~/lib/api/errors";
import sql from "~/lib/db/db";

type EditableContent = { owner_id: null | string; slug: string; user_id: string; };

/** Authorize before media side effects; storage paths must use the persisted slug. */
export async function getEditableContentSlug(type: "event" | "venue", id: string, session: AuthenticatedSession) {
  const [content] = type === "event"
    ? await sql<EditableContent[]>`SELECT slug, user_id, owner_id FROM events WHERE id = ${id}`
    : await sql<EditableContent[]>`SELECT slug, user_id, owner_id FROM venues WHERE id = ${id}`;
  if (!content) throw new NotFoundError("Content not found");
  // Keep event permissions aligned with Hasura: only its submitter or an admin can edit.
  const canEdit = session.user.role === "admin" || (type === "event"
    ? content.user_id === session.user.id
    : content.owner_id === session.user.id || (content.owner_id === null && content.user_id === session.user.id));
  if (!canEdit) throw new ForbiddenError("You cannot edit this content");
  return content.slug;
}
