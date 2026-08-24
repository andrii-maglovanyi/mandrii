import { ForbiddenError, NotFoundError } from "~/lib/api/errors";
import sql from "~/lib/db/db";
import { Event_Status_Enum, Venue_Status_Enum } from "~/types";
import { UserSession } from "~/types/user";
import { UUID } from "~/types/uuid";

type ContentStatusChange =
  | {
      id: UUID;
      status: Event_Status_Enum;
      type: "event";
    }
  | {
      id: UUID;
      status: Venue_Status_Enum;
      type: "venue";
    };

type ContentRecord = {
  user_id: string;
};

const VERIFIED_EVENT_STATUSES = new Set<Event_Status_Enum>([
  Event_Status_Enum.Active,
  Event_Status_Enum.Archived,
  Event_Status_Enum.Cancelled,
]);

const VERIFIED_VENUE_STATUSES = new Set<Venue_Status_Enum>([Venue_Status_Enum.Active, Venue_Status_Enum.Archived]);

const isStatusAllowedForVerifiedContributor = ({ status, type }: ContentStatusChange) =>
  type === "event"
    ? VERIFIED_EVENT_STATUSES.has(status as Event_Status_Enum)
    : VERIFIED_VENUE_STATUSES.has(status as Venue_Status_Enum);

/**
 * Changes a content status after checking the live actor record. Admins can
 * manage every record; verified contributors can manage only records they
 * created, with a deliberately limited set of publication states.
 */
export async function updateContentStatus(change: ContentStatusChange, actor: UserSession) {
  const [content] =
    change.type === "event"
      ? await sql<ContentRecord[]>`SELECT user_id FROM events WHERE id = ${change.id}`
      : await sql<ContentRecord[]>`SELECT user_id FROM venues WHERE id = ${change.id}`;

  if (!content) {
    throw new NotFoundError(change.type === "event" ? "Event not found" : "Venue not found");
  }

  const isAdmin = actor.role === "admin";
  const isVerifiedOwner = actor.is_verified_contributor === true && content.user_id === actor.id;

  if (!isAdmin && !isVerifiedOwner) {
    throw new ForbiddenError("Only trusted contributors can manage the status of content they created");
  }

  if (!isAdmin && !isStatusAllowedForVerifiedContributor(change)) {
    throw new ForbiddenError("Trusted contributors cannot set this status");
  }

  const [updated] =
    change.type === "event"
      ? await sql<{ id: UUID; status: Event_Status_Enum }[]>`
          UPDATE events
          SET status = ${change.status}
          WHERE id = ${change.id}
          RETURNING id, status
        `
      : await sql<{ id: UUID; status: Venue_Status_Enum }[]>`
          UPDATE venues
          SET status = ${change.status}
          WHERE id = ${change.id}
          RETURNING id, status
        `;

  if (!updated) {
    throw new NotFoundError(change.type === "event" ? "Event not found" : "Venue not found");
  }

  return updated;
}
