import { ForbiddenError, NotFoundError } from "~/lib/api";
import sql from "~/lib/db/db";
import { RatingTargetType } from "~/lib/ratings/types";
import { ContentUpdate, ContentUpdateCursor, ContentUpdatesResponse } from "~/lib/updates/types";

type UpdateRow = {
  author_id: string;
  author_image: null | string;
  author_name: null | string;
  body: string;
  created_at: Date | string;
  id: string;
  images: string[];
  is_highlighted: boolean;
  is_pinned: boolean;
  updated_at: Date | string;
};

const toUpdate = (row: UpdateRow): ContentUpdate => ({
  author: {
    id: row.author_id,
    image: row.author_image,
    name: row.author_name,
  },
  body: row.body,
  createdAt: new Date(row.created_at).toISOString(),
  id: row.id,
  images: row.images,
  isHighlighted: row.is_highlighted,
  isPinned: row.is_pinned,
  updatedAt: new Date(row.updated_at).toISOString(),
});

const getPublicTarget = async (type: RatingTargetType, targetId: string) => {
  const [target] =
    type === "venue"
      ? await sql<{ id: string }[]>`
          SELECT id
          FROM venues
          WHERE id = ${targetId} AND status IN ('ACTIVE', 'ARCHIVED')
        `
      : await sql<{ id: string }[]>`
          SELECT id
          FROM events
          WHERE id = ${targetId} AND status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')
        `;

  if (!target) throw new NotFoundError("The content updates you want to view were not found");
  return target;
};

export async function getContentUpdates(
  type: RatingTargetType,
  targetId: string,
  cursor: ContentUpdateCursor | null,
  limit: number,
): Promise<ContentUpdatesResponse> {
  await getPublicTarget(type, targetId);

  const targetColumn = type === "venue" ? sql`venue_id` : sql`event_id`;
  const cursorFilter = cursor
    ? sql`
        AND (content_update.is_pinned, content_update.created_at, content_update.id)
          < (${cursor.isPinned}, ${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)
      `
    : sql``;
  const rows = await sql<UpdateRow[]>`
    SELECT content_update.id, content_update.body, content_update.images, content_update.is_highlighted, content_update.is_pinned, content_update.created_at, content_update.updated_at,
           author.id AS author_id, author.name AS author_name, author.image AS author_image
    FROM content_updates content_update
    JOIN users author ON author.id = content_update.author_id
    WHERE ${targetColumn} = ${targetId}
      ${cursorFilter}
    ORDER BY content_update.is_pinned DESC, content_update.created_at DESC, content_update.id DESC
    LIMIT ${limit + 1}
  `;

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const last = visibleRows.at(-1);

  return {
    nextCursor:
      hasMore && last ? `${last.is_pinned ? "1" : "0"}|${new Date(last.created_at).toISOString()}|${last.id}` : null,
    updates: visibleRows.map(toUpdate),
  };
}

export async function createContentUpdate(
  type: RatingTargetType,
  targetId: string,
  userId: string,
  body: string,
  isHighlighted: boolean,
) {
  const [created] =
    type === "venue"
      ? await sql<{ id: string }[]>`
          WITH target AS (
            SELECT id
            FROM venues
            WHERE id = ${targetId} AND owner_id = ${userId} AND status = 'ACTIVE'
          )
          INSERT INTO content_updates (venue_id, author_id, body, is_highlighted)
          SELECT id, ${userId}, ${body}, ${isHighlighted}
          FROM target
          RETURNING id
        `
      : await sql<{ id: string }[]>`
          WITH target AS (
            SELECT id
            FROM events
            WHERE id = ${targetId} AND owner_id = ${userId} AND status IN ('ACTIVE', 'COMPLETED')
          )
          INSERT INTO content_updates (event_id, author_id, body, is_highlighted)
          SELECT id, ${userId}, ${body}, ${isHighlighted}
          FROM target
          RETURNING id
        `;

  if (!created) throw new ForbiddenError("Only the published content owner can post updates");
  return created.id;
}

export async function setContentUpdateImages(updateId: string, userId: string, images: string[]) {
  const [updated] = await sql<{ id: string }[]>`
    UPDATE content_updates
    SET images = ${images}::text[]
    WHERE id = ${updateId} AND author_id = ${userId}
    RETURNING id
  `;

  if (!updated) throw new ForbiddenError("Only the update author can add images");
}

export async function updateContentUpdate(updateId: string, userId: string, body: string) {
  const [updated] = await sql<{ id: string }[]>`
    UPDATE content_updates content_update
    SET body = ${body}
    FROM venues venue
    WHERE content_update.id = ${updateId}
      AND content_update.venue_id = venue.id
      AND venue.owner_id = ${userId}
      AND venue.status = 'ACTIVE'
    RETURNING content_update.id
  `;

  if (updated) return updated.id;

  const [eventUpdated] = await sql<{ id: string }[]>`
    UPDATE content_updates content_update
    SET body = ${body}
    FROM events event
    WHERE content_update.id = ${updateId}
      AND content_update.event_id = event.id
      AND event.owner_id = ${userId}
      AND event.status IN ('ACTIVE', 'COMPLETED')
    RETURNING content_update.id
  `;

  if (!eventUpdated) throw new ForbiddenError("Only the published content owner can edit this update");
  return eventUpdated.id;
}

export async function removeContentUpdate(updateId: string, userId: string) {
  const [deleted] = await sql<{ id: string; images: string[] }[]>`
    DELETE FROM content_updates content_update
    USING venues venue
    WHERE content_update.id = ${updateId}
      AND content_update.venue_id = venue.id
      AND venue.owner_id = ${userId}
      AND venue.status = 'ACTIVE'
    RETURNING content_update.id, content_update.images
  `;

  if (deleted) return deleted;

  const [eventDeleted] = await sql<{ id: string; images: string[] }[]>`
    DELETE FROM content_updates content_update
    USING events event
    WHERE content_update.id = ${updateId}
      AND content_update.event_id = event.id
      AND event.owner_id = ${userId}
      AND event.status IN ('ACTIVE', 'COMPLETED')
    RETURNING content_update.id, content_update.images
  `;

  if (eventDeleted) return eventDeleted;

  throw new ForbiddenError("Only the published content owner can remove this update");
}

/** Removes an update that was just created but could not finish publishing (for example, image upload failed). */
export async function removeFailedContentUpdate(updateId: string, userId: string) {
  const [deleted] = await sql<{ images: string[] }[]>`
    DELETE FROM content_updates
    WHERE id = ${updateId} AND author_id = ${userId}
    RETURNING images
  `;

  return deleted?.images ?? [];
}

export async function setContentUpdatePinned(updateId: string, userId: string, isPinned: boolean) {
  return sql.begin(async (transaction) => {
    const [candidate] = await transaction<Array<{ event_id: null | string; venue_id: null | string }>>`
      SELECT content_update.id, content_update.venue_id, content_update.event_id
      FROM content_updates content_update
      LEFT JOIN venues venue ON venue.id = content_update.venue_id
      LEFT JOIN events event ON event.id = content_update.event_id
      WHERE content_update.id = ${updateId}
        AND (
          (content_update.venue_id IS NOT NULL AND venue.owner_id = ${userId} AND venue.status = 'ACTIVE')
          OR (
            content_update.event_id IS NOT NULL
            AND event.owner_id = ${userId}
            AND event.status IN ('ACTIVE', 'COMPLETED')
          )
        )
    `;

    if (!candidate) throw new ForbiddenError("Only the published content owner can pin this update");

    const targetId = candidate.venue_id ?? candidate.event_id;
    if (!targetId) throw new NotFoundError("The update target was not found");

    await transaction`SELECT pg_advisory_xact_lock(hashtext(${targetId}))`;

    // Take the per-target lock before row locks. Pinning two different updates
    // concurrently must not deadlock when each transaction clears the other's pin.
    const [update] = await transaction<Array<{ event_id: null | string; venue_id: null | string }>>`
      SELECT content_update.venue_id, content_update.event_id
      FROM content_updates content_update
      LEFT JOIN venues venue ON venue.id = content_update.venue_id
      LEFT JOIN events event ON event.id = content_update.event_id
      WHERE content_update.id = ${updateId}
        AND (
          (content_update.venue_id IS NOT NULL AND venue.owner_id = ${userId} AND venue.status = 'ACTIVE')
          OR (
            content_update.event_id IS NOT NULL
            AND event.owner_id = ${userId}
            AND event.status IN ('ACTIVE', 'COMPLETED')
          )
        )
      FOR UPDATE OF content_update
    `;

    if (!update) throw new ForbiddenError("Only the published content owner can pin this update");

    if (isPinned) {
      const targetColumn = update.venue_id ? sql`venue_id` : sql`event_id`;
      await transaction`
        UPDATE content_updates
        SET is_pinned = false
        WHERE ${targetColumn} = ${targetId} AND is_pinned
      `;
    }

    const [pinned] = await transaction<Array<{ is_pinned: boolean }>>`
      UPDATE content_updates
      SET is_pinned = ${isPinned}
      WHERE id = ${updateId}
      RETURNING is_pinned
    `;

    return { isPinned: pinned?.is_pinned ?? false };
  });
}
