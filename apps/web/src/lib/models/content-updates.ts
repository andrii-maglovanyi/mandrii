import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "~/lib/api";
import sql from "~/lib/db/db";
import { RatingTargetType } from "~/lib/ratings/types";
import { ContentUpdate, ContentUpdateComment, ContentUpdateCursor, ContentUpdatesResponse } from "~/lib/updates/types";

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

type CommentRow = {
  author_id: string;
  author_image: null | string;
  author_name: null | string;
  body: string;
  created_at: Date | string;
  id: string;
  parent_id: null | string;
  update_id: string;
  updated_at: Date | string;
};

const toComment = (row: CommentRow): ContentUpdateComment => ({
  author: { id: row.author_id, image: row.author_image, name: row.author_name },
  body: row.body,
  createdAt: new Date(row.created_at).toISOString(),
  id: row.id,
  parentId: row.parent_id,
  updatedAt: new Date(row.updated_at).toISOString(),
});

const toUpdate = (
  row: UpdateRow,
  interaction: { commentCount: number; comments: ContentUpdateComment[]; isLikedByViewer: boolean; likeCount: number },
): ContentUpdate => ({
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
  isLikedByViewer: interaction.isLikedByViewer,
  isPinned: row.is_pinned,
  likeCount: interaction.likeCount,
  commentCount: interaction.commentCount,
  comments: interaction.comments,
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
  viewerId: null | string = null,
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
  const updateIds = visibleRows.map((row) => row.id);
  const interactions = new Map<
    string,
    { commentCount: number; comments: ContentUpdateComment[]; isLikedByViewer: boolean; likeCount: number }
  >();

  if (updateIds.length) {
    const [likeRows, commentCounts, commentRows] = await Promise.all([
      sql<Array<{ is_liked_by_viewer: boolean; like_count: number; update_id: string }>>`
        SELECT content_update_id AS update_id,
               COUNT(*)::int AS like_count,
               COALESCE(BOOL_OR(user_id = ${viewerId}::uuid), false) AS is_liked_by_viewer
        FROM content_update_likes
        WHERE content_update_id = ANY(${updateIds}::uuid[])
        GROUP BY content_update_id
      `,
      sql<Array<{ comment_count: number; update_id: string }>>`
        SELECT content_update_id AS update_id, COUNT(*)::int AS comment_count
        FROM content_update_comments
        WHERE content_update_id = ANY(${updateIds}::uuid[]) AND deleted_at IS NULL
        GROUP BY content_update_id
      `,
      sql<CommentRow[]>`
        WITH ranked_top_level AS (
          SELECT id, content_update_id,
                 ROW_NUMBER() OVER (PARTITION BY content_update_id ORDER BY created_at DESC, id DESC) AS row_number
          FROM content_update_comments
          WHERE content_update_id = ANY(${updateIds}::uuid[]) AND parent_id IS NULL AND deleted_at IS NULL
        ), visible_comments AS (
          SELECT id FROM ranked_top_level WHERE row_number <= 3
          UNION
          SELECT id FROM (
            SELECT reply.id, ROW_NUMBER() OVER (PARTITION BY reply.parent_id ORDER BY reply.created_at DESC, reply.id DESC) AS reply_number
            FROM content_update_comments reply JOIN ranked_top_level parent ON parent.id = reply.parent_id
            WHERE parent.row_number <= 3 AND reply.deleted_at IS NULL
          ) replies WHERE reply_number <= 3
        )
        SELECT comment.id, comment.content_update_id AS update_id, comment.parent_id, comment.body, comment.created_at, comment.updated_at,
               author.id AS author_id, author.name AS author_name, author.image AS author_image
        FROM content_update_comments comment
        JOIN users author ON author.id = comment.user_id
        WHERE comment.id IN (SELECT id FROM visible_comments)
        ORDER BY comment.created_at ASC, comment.id ASC
      `,
    ]);

    for (const id of updateIds)
      interactions.set(id, { commentCount: 0, comments: [], isLikedByViewer: false, likeCount: 0 });
    for (const row of likeRows) {
      interactions.set(row.update_id, {
        ...(interactions.get(row.update_id) ?? { commentCount: 0, comments: [] }),
        isLikedByViewer: row.is_liked_by_viewer,
        likeCount: row.like_count,
      });
    }
    for (const row of commentCounts) {
      const interaction = interactions.get(row.update_id);
      if (interaction) interaction.commentCount = row.comment_count;
    }
    for (const row of commentRows) {
      const interaction = interactions.get(row.update_id);
      if (interaction) {
        interaction.comments.push(toComment(row));
      }
    }
  }

  return {
    nextCursor:
      hasMore && last ? `${last.is_pinned ? "1" : "0"}|${new Date(last.created_at).toISOString()}|${last.id}` : null,
    updates: visibleRows.map((row) =>
      toUpdate(
        row,
        interactions.get(row.id) ?? { commentCount: 0, comments: [], isLikedByViewer: false, likeCount: 0 },
      ),
    ),
  };
}

/** Returns one publicly visible update for a deep link that falls outside the current feed page. */
export async function getContentUpdateById(
  updateId: string,
  type: RatingTargetType,
  targetId: string,
  viewerId: null | string = null,
): Promise<ContentUpdate> {
  const targetColumn = type === "venue" ? sql`content_update.venue_id` : sql`content_update.event_id`;
  const [row] = await sql<UpdateRow[]>`
    SELECT content_update.id, content_update.body, content_update.images, content_update.is_highlighted, content_update.is_pinned,
           content_update.created_at, content_update.updated_at,
           author.id AS author_id, author.name AS author_name, author.image AS author_image
    FROM content_updates content_update
    JOIN users author ON author.id = content_update.author_id
    LEFT JOIN venues venue ON venue.id = content_update.venue_id
    LEFT JOIN events event ON event.id = content_update.event_id
    WHERE content_update.id = ${updateId}
      AND ${targetColumn} = ${targetId}
      AND ((venue.status IN ('ACTIVE', 'ARCHIVED')) OR (event.status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')))
  `;
  if (!row) throw new NotFoundError("The update you want to view was not found");

  const [[likeSummary], [commentSummary]] = await Promise.all([
    sql<Array<{ is_liked_by_viewer: boolean; like_count: number }>>`
      SELECT COUNT(*)::int AS like_count, COALESCE(BOOL_OR(user_id = ${viewerId}::uuid), false) AS is_liked_by_viewer
      FROM content_update_likes WHERE content_update_id = ${updateId}
    `,
    sql<Array<{ comment_count: number }>>`
      SELECT COUNT(*)::int AS comment_count FROM content_update_comments
      WHERE content_update_id = ${updateId} AND deleted_at IS NULL
    `,
  ]);
  return toUpdate(row, {
    commentCount: commentSummary?.comment_count ?? 0,
    comments: [],
    isLikedByViewer: likeSummary?.is_liked_by_viewer ?? false,
    likeCount: likeSummary?.like_count ?? 0,
  });
}

export async function toggleContentUpdateLike(updateId: string, userId: string) {
  await assertPublicContentUpdate(updateId);
  return sql.begin(async (transaction) => {
    // A double-click (or two open tabs) can otherwise race: both requests see
    // no like, one inserts, and the other loses the unique-key conflict.
    await transaction`SELECT pg_advisory_xact_lock(hashtext(${`content-update-like:${updateId}:${userId}`}))`;
    const [removed] = await transaction<{ id: string }[]>`
      DELETE FROM content_update_likes
      WHERE content_update_id = ${updateId} AND user_id = ${userId}
      RETURNING content_update_id AS id
    `;
    if (!removed) {
      const [created] = await transaction<{ id: string }[]>`
        INSERT INTO content_update_likes (content_update_id, user_id)
        SELECT id, ${userId} FROM content_updates WHERE id = ${updateId}
        ON CONFLICT DO NOTHING
        RETURNING content_update_id AS id
      `;
      if (!created) throw new NotFoundError("The update you want to like was not found");
    }
    const [summary] = await transaction<{ like_count: number }[]>`
      SELECT COUNT(*)::int AS like_count FROM content_update_likes WHERE content_update_id = ${updateId}
    `;
    return { isLikedByViewer: !removed, likeCount: summary.like_count };
  });
}

export async function createContentUpdateComment(
  updateId: string,
  userId: string,
  body: string,
  parentId: null | string,
) {
  await assertPublicContentUpdate(updateId);
  const [blocked] = await sql<{ term: string }[]>`
    SELECT term FROM content_comment_blocked_terms
    WHERE strpos(' ' || regexp_replace(lower(${body}), '[^[:alnum:]]+', ' ', 'g') || ' ', ' ' || regexp_replace(lower(term), '[^[:alnum:]]+', ' ', 'g') || ' ') > 0 LIMIT 1
  `;
  if (blocked) throw new BadRequestError("This comment contains blocked language");
  const comment = await sql.begin(async (transaction) => {
    // Serialize a member's submissions on one update so the duplicate check
    // and insert cannot both succeed from a double-click or parallel tab.
    await transaction`SELECT pg_advisory_xact_lock(hashtext(${`content-update-comment:${updateId}:${userId}`}))`;
    const [duplicate] = await transaction<{ id: string }[]>`
      SELECT id FROM content_update_comments
      WHERE content_update_id = ${updateId} AND user_id = ${userId} AND lower(body) = lower(${body})
        AND created_at > NOW() - INTERVAL '5 minutes' AND deleted_at IS NULL LIMIT 1
    `;
    if (duplicate) throw new BadRequestError("Please do not post the same comment twice");
    if (parentId) {
      await transaction`SELECT pg_advisory_xact_lock(hashtext(${`content-update-comment-thread:${parentId}`}))`;
      const [parent] = await transaction<{ id: string }[]>`
        SELECT id
        FROM content_update_comments
        WHERE id = ${parentId} AND content_update_id = ${updateId} AND parent_id IS NULL AND deleted_at IS NULL
      `;
      if (!parent) throw new BadRequestError("Replies must belong to a top-level comment on this update");
    }
    const [created] = await transaction<CommentRow[]>`
      INSERT INTO content_update_comments (content_update_id, user_id, body, parent_id)
      SELECT content_update.id, ${userId}, ${body}, ${parentId}::uuid
      FROM content_updates content_update
      WHERE content_update.id = ${updateId}
      RETURNING id, content_update_id AS update_id, parent_id, body, created_at, updated_at,
                ${userId}::uuid AS author_id, NULL::text AS author_name, NULL::text AS author_image
    `;
    if (!created) throw new NotFoundError("The update you want to comment on was not found");
    return created;
  });

  const [author] = await sql<Array<{ image: null | string; name: null | string }>>`
    SELECT image, name FROM users WHERE id = ${userId}
  `;
  const result = toComment({
    ...comment,
    author_id: userId,
    author_image: author?.image ?? null,
    author_name: author?.name ?? null,
  });
  await sql`
    INSERT INTO content_update_notifications (recipient_id, actor_id, content_update_id, comment_id, kind)
    SELECT recipient_id, ${userId}, ${updateId}, ${result.id}, kind
    FROM (
      SELECT DISTINCT ON (recipient_id) recipient_id, kind
      FROM (
      SELECT content_update.author_id AS recipient_id, 'COMMENT'::text AS kind
      FROM content_updates content_update WHERE content_update.id = ${updateId}
      UNION ALL
      SELECT parent.user_id, 'REPLY'::text FROM content_update_comments parent WHERE parent.id = ${parentId}::uuid
      ) candidates
      LEFT JOIN content_update_notification_preferences preference ON preference.user_id = recipient_id
      WHERE recipient_id <> ${userId}
        AND (kind = 'COMMENT' AND COALESCE(preference.comments_enabled, true)
          OR kind = 'REPLY' AND COALESCE(preference.replies_enabled, true))
      ORDER BY recipient_id, (kind = 'REPLY') DESC
    ) recipients
  `.catch((error) => console.error("Failed to create content update notification", error));
  return result;
}

export async function removeContentUpdateComment(updateId: string, commentId: string, userId: string) {
  return sql.begin(async (transaction) => {
    // Coordinate with reply creation so a reply cannot commit after its
    // top-level parent and existing replies have been soft-deleted.
    await transaction`SELECT pg_advisory_xact_lock(hashtext(${`content-update-comment-thread:${commentId}`}))`;
    const ownerDeleted = await transaction<{ id: string }[]>`
      UPDATE content_update_comments comment
      SET deleted_at = NOW(), deleted_by_user_id = ${userId}
      FROM content_updates content_update
      LEFT JOIN venues venue ON venue.id = content_update.venue_id
      LEFT JOIN events event ON event.id = content_update.event_id
      WHERE (comment.id = ${commentId} OR comment.parent_id = ${commentId})
        AND content_update.id = ${updateId}
        AND comment.content_update_id = content_update.id
        AND comment.deleted_at IS NULL
        AND ((venue.owner_id = ${userId} AND venue.status IN ('ACTIVE', 'ARCHIVED'))
          OR (event.owner_id = ${userId} AND event.status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')))
      RETURNING comment.id
    `;
    if (ownerDeleted.length) return ownerDeleted.length;
    const authorDeleted = await transaction<{ id: string }[]>`
      UPDATE content_update_comments comment SET deleted_at = NOW(), deleted_by_user_id = ${userId}
      WHERE comment.content_update_id = ${updateId} AND comment.deleted_at IS NULL
        AND (
          (comment.id = ${commentId} AND comment.user_id = ${userId})
          OR (
            comment.parent_id = ${commentId}
            AND EXISTS (
              SELECT 1 FROM content_update_comments parent
              WHERE parent.id = ${commentId} AND parent.content_update_id = ${updateId}
                AND parent.parent_id IS NULL AND parent.user_id = ${userId}
            )
          )
        )
        AND comment.created_at > NOW() - INTERVAL '15 minutes'
      RETURNING comment.id
    `;
    if (!authorDeleted.length)
      throw new ForbiddenError("Only the content owner or comment author within 15 minutes can remove this comment");
    return authorDeleted.length;
  });
}

export async function editContentUpdateComment(updateId: string, commentId: string, userId: string, body: string) {
  const [blocked] = await sql<{ term: string }[]>`
    SELECT term FROM content_comment_blocked_terms
    WHERE strpos(' ' || regexp_replace(lower(${body}), '[^[:alnum:]]+', ' ', 'g') || ' ', ' ' || regexp_replace(lower(term), '[^[:alnum:]]+', ' ', 'g') || ' ') > 0 LIMIT 1
  `;
  if (blocked) throw new BadRequestError("This comment contains blocked language");
  const [duplicate] = await sql<{ id: string }[]>`
    SELECT id FROM content_update_comments WHERE content_update_id = ${updateId} AND user_id = ${userId}
      AND id <> ${commentId} AND lower(body) = lower(${body}) AND created_at > NOW() - INTERVAL '5 minutes' AND deleted_at IS NULL LIMIT 1
  `;
  if (duplicate) throw new BadRequestError("Please do not post the same comment twice");
  const [comment] = await sql<CommentRow[]>`
    UPDATE content_update_comments
    SET body = ${body}
    WHERE id = ${commentId} AND content_update_id = ${updateId} AND user_id = ${userId} AND deleted_at IS NULL
      AND created_at > NOW() - INTERVAL '15 minutes'
    RETURNING id, content_update_id AS update_id, parent_id, body, created_at, updated_at,
      ${userId}::uuid AS author_id, NULL::text AS author_name, NULL::text AS author_image
  `;
  if (!comment) throw new ForbiddenError("Comments can only be edited by their author within 15 minutes");
  const [author] = await sql<
    Array<{ image: null | string; name: null | string }>
  >`SELECT image, name FROM users WHERE id = ${userId}`;
  return toComment({
    ...comment,
    author_id: userId,
    author_image: author?.image ?? null,
    author_name: author?.name ?? null,
  });
}

export async function reportContentUpdateComment(updateId: string, commentId: string, userId: string, reason: string) {
  const [report] = await sql<{ id: string }[]>`
    INSERT INTO content_update_comment_reports (comment_id, user_id, reason)
    SELECT comment.id, ${userId}, ${reason} FROM content_update_comments comment
    WHERE comment.id = ${commentId} AND comment.content_update_id = ${updateId} AND comment.user_id <> ${userId} AND comment.deleted_at IS NULL
    ON CONFLICT (comment_id, user_id) DO NOTHING RETURNING id
  `;
  if (!report) throw new ConflictError("You have already reported this comment");
}

export async function getContentUpdateNotifications(userId: string) {
  const [preferences, notifications] = await Promise.all([
    sql<Array<{ comments_enabled: boolean; replies_enabled: boolean }>>`
      SELECT comments_enabled, replies_enabled FROM content_update_notification_preferences WHERE user_id = ${userId}
    `,
    sql<
      Array<{
        actor_name: null | string;
        comment_body: string;
        created_at: Date | string;
        id: string;
        kind: "COMMENT" | "REPLY";
        update_id: string;
      }>
    >`
      SELECT notification.id, notification.kind, notification.content_update_id AS update_id, notification.created_at,
             actor.name AS actor_name, comment.body AS comment_body
      FROM content_update_notifications notification
      JOIN users actor ON actor.id = notification.actor_id
      JOIN content_update_comments comment ON comment.id = notification.comment_id
      WHERE notification.recipient_id = ${userId} AND comment.deleted_at IS NULL
      ORDER BY notification.created_at DESC LIMIT 20
    `,
  ]);
  return {
    notifications: notifications.map((notification) => ({
      ...notification,
      createdAt: new Date(notification.created_at).toISOString(),
    })),
    preferences: preferences[0] ?? { comments_enabled: true, replies_enabled: true },
  };
}

export async function getContentUpdateCommentPage(updateId: string, cursor: null | string, limit = 10) {
  const cursorFilter = cursor
    ? sql`AND (comment.created_at, comment.id) < (${cursor.split("|")[0]}::timestamptz, ${cursor.split("|")[1]}::uuid)`
    : sql``;
  const rows = await sql<CommentRow[]>`
    WITH top_level AS (
      SELECT comment.id, comment.content_update_id, comment.parent_id, comment.user_id, comment.body, comment.created_at, comment.updated_at
      FROM content_update_comments comment
      WHERE comment.content_update_id = ${updateId} AND comment.parent_id IS NULL AND comment.deleted_at IS NULL ${cursorFilter}
      ORDER BY comment.created_at DESC, comment.id DESC LIMIT ${limit + 1}
    ), visible_top_level AS (SELECT * FROM top_level LIMIT ${limit}), visible AS (
      SELECT * FROM visible_top_level
      UNION ALL
      SELECT id, content_update_id, parent_id, user_id, body, created_at, updated_at FROM (
        SELECT reply.*, ROW_NUMBER() OVER (PARTITION BY reply.parent_id ORDER BY reply.created_at DESC, reply.id DESC) AS reply_number
        FROM content_update_comments reply JOIN visible_top_level parent ON parent.id = reply.parent_id
        WHERE reply.deleted_at IS NULL
      ) replies WHERE reply_number <= 3
    )
    SELECT visible.id, visible.content_update_id AS update_id, visible.parent_id, visible.body, visible.created_at, visible.updated_at,
           author.id AS author_id, author.name AS author_name, author.image AS author_image
    FROM visible JOIN users author ON author.id = visible.user_id
    ORDER BY visible.created_at ASC, visible.id ASC
  `;
  const topLevelRows = rows.filter((row) => !row.parent_id);
  const oldest = topLevelRows[0];
  const [more] = oldest
    ? await sql<Array<{ exists: boolean }>>`
        SELECT EXISTS(
          SELECT 1 FROM content_update_comments
          WHERE content_update_id = ${updateId} AND parent_id IS NULL AND deleted_at IS NULL
            AND (created_at, id) < (${new Date(oldest.created_at).toISOString()}::timestamptz, ${oldest.id}::uuid)
        ) AS exists
      `
    : [{ exists: false }];
  return {
    comments: rows.map(toComment),
    nextCursor: more.exists && oldest ? `${new Date(oldest.created_at).toISOString()}|${oldest.id}` : null,
  };
}

export async function getContentUpdateCommentReplies(
  updateId: string,
  commentId: string,
  cursor: null | string,
  limit = 10,
) {
  const cursorFilter = cursor
    ? sql`AND (reply.created_at, reply.id) < (${cursor.split("|")[0]}::timestamptz, ${cursor.split("|")[1]}::uuid)`
    : sql``;
  const rows = await sql<CommentRow[]>`
    SELECT reply.id, reply.content_update_id AS update_id, reply.parent_id, reply.body, reply.created_at, reply.updated_at,
           author.id AS author_id, author.name AS author_name, author.image AS author_image
    FROM content_update_comments reply JOIN users author ON author.id = reply.user_id
    WHERE reply.content_update_id = ${updateId} AND reply.parent_id = ${commentId} AND reply.deleted_at IS NULL ${cursorFilter}
    ORDER BY reply.created_at DESC, reply.id DESC LIMIT ${limit + 1}
  `;
  const visible = rows.slice(0, limit);
  const last = visible.at(-1);
  return {
    // The query runs newest-first so the cursor can continue toward older
    // replies. Render each fetched page oldest-first, matching the initial
    // discussion preview and the order people expect in a conversation.
    comments: [...visible].reverse().map(toComment),
    nextCursor: rows.length > limit && last ? `${new Date(last.created_at).toISOString()}|${last.id}` : null,
  };
}

export async function assertPublicContentUpdate(updateId: string) {
  const [update] = await sql<{ id: string }[]>`
    SELECT content_update.id FROM content_updates content_update
    LEFT JOIN venues venue ON venue.id = content_update.venue_id
    LEFT JOIN events event ON event.id = content_update.event_id
    WHERE content_update.id = ${updateId}
      AND ((venue.status IN ('ACTIVE', 'ARCHIVED')) OR (event.status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')))
  `;
  if (!update) throw new NotFoundError("The update you want to view was not found");
}

export async function setContentUpdateNotificationPreferences(
  userId: string,
  commentsEnabled: boolean,
  repliesEnabled: boolean,
) {
  const [preferences] = await sql<Array<{ comments_enabled: boolean; replies_enabled: boolean }>>`
    INSERT INTO content_update_notification_preferences (user_id, comments_enabled, replies_enabled)
    VALUES (${userId}, ${commentsEnabled}, ${repliesEnabled})
    ON CONFLICT (user_id) DO UPDATE SET comments_enabled = EXCLUDED.comments_enabled, replies_enabled = EXCLUDED.replies_enabled
    RETURNING comments_enabled, replies_enabled
  `;
  return preferences;
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
