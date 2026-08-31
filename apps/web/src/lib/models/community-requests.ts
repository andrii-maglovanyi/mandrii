import { ConflictError, ForbiddenError, NotFoundError } from "~/lib/api";
import sql from "~/lib/db/db";
import {
  CommunityRelatedContent,
  CommunityRequest,
  CommunityRequestCursor,
  CommunityRequestCategory,
  CommunityRequestFilters,
  CommunityRequestKind,
  CommunityRequestResponse,
  CommunityResponseMessage,
  CommunityResponseThread,
  CommunityRequestsPage,
} from "~/lib/community-requests/types";

type CommunityRequestRow = {
  author_id: string;
  author_image: null | string;
  author_name: null | string;
  body: string;
  category: CommunityRequestCategory;
  country: string;
  created_at: Date | string;
  expires_at: Date | string;
  id: string;
  kind: CommunityRequestKind;
  location: null | string;
  location_rank: 0 | 1;
  related_event_id: null | string;
  related_event_name: null | string;
  related_event_slug: null | string;
  related_venue_id: null | string;
  related_venue_name: null | string;
  related_venue_slug: null | string;
  response_count: number;
  status: "CLOSED" | "OPEN";
  title: string;
  viewer_response_id: null | string;
};

type CommunityRequestResponseRow = {
  author_id: string;
  author_image: null | string;
  author_name: null | string;
  body: string;
  created_at: Date | string;
  id: string;
  message_count: number;
  request_id: string;
};

type CommunityResponseMessageRow = {
  body: string;
  created_at: Date | string;
  id: string;
  sender_user_id: string;
  source: "TELEGRAM" | "WEB";
};

const toCommunityRequest = (row: CommunityRequestRow): CommunityRequest => ({
  author: { id: row.author_id, image: row.author_image, name: row.author_name },
  body: row.body,
  category: row.category,
  country: row.country,
  createdAt: new Date(row.created_at).toISOString(),
  expiresAt: new Date(row.expires_at).toISOString(),
  id: row.id,
  kind: row.kind,
  location: row.location,
  relatedContent: row.related_venue_id
    ? {
        id: row.related_venue_id,
        name: row.related_venue_name ?? "",
        slug: row.related_venue_slug ?? "",
        type: "VENUE",
      }
    : row.related_event_id
      ? {
          id: row.related_event_id,
          name: row.related_event_name ?? "",
          slug: row.related_event_slug ?? "",
          type: "EVENT",
        }
      : null,
  responseCount: row.response_count,
  status: row.status,
  title: row.title,
  viewerResponseId: row.viewer_response_id,
});

const toResponse = (row: CommunityRequestResponseRow): CommunityRequestResponse => ({
  author: { id: row.author_id, image: row.author_image, name: row.author_name },
  body: row.body,
  createdAt: new Date(row.created_at).toISOString(),
  id: row.id,
  messageCount: row.message_count,
});

const toResponseMessage = (row: CommunityResponseMessageRow): CommunityResponseMessage => ({
  body: row.body,
  createdAt: new Date(row.created_at).toISOString(),
  id: row.id,
  senderUserId: row.sender_user_id,
  source: row.source,
});

export async function getCommunityRequests(
  filters: CommunityRequestFilters = {},
  limit = 30,
): Promise<CommunityRequest[]> {
  return (await getCommunityRequestPage(filters, null, limit)).requests;
}

export async function getCommunityRequestPage(
  filters: CommunityRequestFilters = {},
  cursor: CommunityRequestCursor | null,
  limit = 12,
): Promise<CommunityRequestsPage> {
  const pageSize = Math.min(Math.max(limit, 1), 30);
  const locationRank = filters.location
    ? sql`CASE WHEN lower(request.location) = lower(${filters.location}) THEN 0 ELSE 1 END`
    : sql`0`;
  const cursorFilter = cursor
    ? sql`
        AND (
          ${locationRank} > ${cursor.locationRank}
          OR (
            ${locationRank} = ${cursor.locationRank}
            AND (request.created_at, request.id) < (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)
          )
        )
      `
    : sql``;
  const rows = await sql<CommunityRequestRow[]>`
    SELECT request.id, request.kind, request.category, request.title, request.body, request.country, request.location,
           request.status, request.expires_at, request.created_at,
           ${locationRank} AS location_rank,
           author.id AS author_id, author.name AS author_name, author.image AS author_image,
           venue.id AS related_venue_id, venue.name AS related_venue_name, venue.slug AS related_venue_slug,
           event.id AS related_event_id, COALESCE(event.title_en, event.title_uk) AS related_event_name,
           event.slug AS related_event_slug,
           ${filters.viewerUserId ? sql`(SELECT id FROM community_request_responses response WHERE response.request_id = request.id AND response.user_id = ${filters.viewerUserId})` : sql`NULL::uuid`} AS viewer_response_id,
           (
             SELECT COUNT(*)::int
             FROM community_request_responses response
             WHERE response.request_id = request.id
           ) AS response_count
    FROM community_requests request
    JOIN users author ON author.id = request.user_id
    LEFT JOIN venues venue ON venue.id = request.venue_id
    LEFT JOIN events event ON event.id = request.event_id
    WHERE request.status = 'OPEN'
      AND request.expires_at > NOW()
      ${filters.kind ? sql`AND request.kind = ${filters.kind}` : sql``}
      ${filters.category ? sql`AND request.category = ${filters.category}` : sql``}
      ${filters.country ? sql`AND request.country = ${filters.country}` : sql``}
      ${filters.relatedVenueId ? sql`AND request.venue_id = ${filters.relatedVenueId}` : sql``}
      ${filters.relatedEventId ? sql`AND request.event_id = ${filters.relatedEventId}` : sql``}
      ${filters.query ? sql`AND (request.title ILIKE ${`%${filters.query}%`} OR request.body ILIKE ${`%${filters.query}%`})` : sql``}
      ${cursorFilter}
    ORDER BY
      location_rank,
      request.created_at DESC, request.id DESC
    LIMIT ${pageSize + 1}
  `;
  const hasMore = rows.length > pageSize;
  const visibleRows = hasMore ? rows.slice(0, pageSize) : rows;
  const last = visibleRows.at(-1);
  const [{ total }] = await sql<Array<{ total: number }>>`
    SELECT COUNT(*)::int AS total
    FROM community_requests request
    WHERE request.status = 'OPEN'
      AND request.expires_at > NOW()
      ${filters.kind ? sql`AND request.kind = ${filters.kind}` : sql``}
      ${filters.category ? sql`AND request.category = ${filters.category}` : sql``}
      ${filters.country ? sql`AND request.country = ${filters.country}` : sql``}
      ${filters.relatedVenueId ? sql`AND request.venue_id = ${filters.relatedVenueId}` : sql``}
      ${filters.relatedEventId ? sql`AND request.event_id = ${filters.relatedEventId}` : sql``}
      ${filters.query ? sql`AND (request.title ILIKE ${`%${filters.query}%`} OR request.body ILIKE ${`%${filters.query}%`})` : sql``}
  `;
  return {
    nextCursor: hasMore && last ? `${last.location_rank}|${new Date(last.created_at).toISOString()}|${last.id}` : null,
    requests: visibleRows.map(toCommunityRequest),
    total,
  };
}

export async function searchCommunityRelatedContent(query: string): Promise<CommunityRelatedContent[]> {
  const term = `%${query.trim()}%`;
  const rows = await sql<Array<CommunityRelatedContent & { type: "EVENT" | "VENUE" }>>`
    SELECT id, name, slug, type
    FROM (
      SELECT venue.id, venue.name, venue.slug, 'VENUE'::text AS type
      FROM venues venue
      WHERE venue.status = 'ACTIVE' AND venue.name ILIKE ${term}
      UNION ALL
      SELECT event.id, COALESCE(event.title_en, event.title_uk) AS name, event.slug, 'EVENT'::text AS type
      FROM events event
      WHERE event.status = 'ACTIVE'
        AND COALESCE(event.title_en, event.title_uk) ILIKE ${term}
    ) content
    ORDER BY name ASC
    LIMIT 12
  `;
  return rows;
}

export async function createCommunityRequest(input: {
  body: string;
  category: CommunityRequestCategory;
  country: string;
  expiresAt: Date;
  kind: CommunityRequestKind;
  location: null | string;
  relatedEventId: null | string;
  relatedVenueId: null | string;
  title: string;
  userId: string;
}): Promise<CommunityRequest> {
  await validateRelatedContent(input.relatedVenueId, input.relatedEventId);

  return sql.begin(async (transaction) => {
    // Serialise post creation per author. This makes the active-post limit reliable
    // even if a browser retries or two requests arrive at the same time.
    await transaction`
      SELECT id FROM users WHERE id = ${input.userId} FOR UPDATE
    `;
    const [{ active_count: activeCount }] = await transaction<Array<{ active_count: number }>>`
      SELECT COUNT(*)::int AS active_count
      FROM community_requests
      WHERE user_id = ${input.userId} AND status = 'OPEN' AND expires_at > NOW()
    `;
    if (activeCount >= 10) throw new ConflictError("You already have 10 active community posts");

    const [row] = await transaction<CommunityRequestRow[]>`
      INSERT INTO community_requests (user_id, kind, category, title, body, country, location, venue_id, event_id, expires_at)
      VALUES (${input.userId}, ${input.kind}, ${input.category}, ${input.title}, ${input.body}, ${input.country}, ${input.location}, ${input.relatedVenueId}, ${input.relatedEventId}, ${input.expiresAt})
      RETURNING id, kind, category, title, body, country, location, status, expires_at, created_at,
        ${input.userId}::uuid AS author_id,
        (SELECT name FROM users WHERE id = ${input.userId}) AS author_name,
        (SELECT image FROM users WHERE id = ${input.userId}) AS author_image,
        (SELECT id FROM venues WHERE id = ${input.relatedVenueId}) AS related_venue_id,
        (SELECT name FROM venues WHERE id = ${input.relatedVenueId}) AS related_venue_name,
        (SELECT slug FROM venues WHERE id = ${input.relatedVenueId}) AS related_venue_slug,
        (SELECT id FROM events WHERE id = ${input.relatedEventId}) AS related_event_id,
        (SELECT COALESCE(title_en, title_uk) FROM events WHERE id = ${input.relatedEventId}) AS related_event_name,
        (SELECT slug FROM events WHERE id = ${input.relatedEventId}) AS related_event_slug,
        0::int AS response_count,
        0::int AS location_rank,
        NULL::uuid AS viewer_response_id
    `;
    return toCommunityRequest(row);
  });
}

export async function createCommunityRequestResponse(input: {
  body: string;
  requestId: string;
  userId: string;
}): Promise<CommunityRequestResponse> {
  type ResponseInsertResult = CommunityRequestResponseRow & {
    request_author_id: null | string;
    request_exists: boolean;
    request_is_open: boolean;
  };
  const [result] = await sql<ResponseInsertResult[]>`
    WITH target AS MATERIALIZED (
      SELECT id, user_id, status, expires_at
      FROM community_requests
      WHERE id = ${input.requestId}
      FOR SHARE
    ), inserted AS (
      INSERT INTO community_request_responses (request_id, user_id, body)
      SELECT target.id, ${input.userId}, ${input.body}
      FROM target
      WHERE target.user_id <> ${input.userId}
        AND target.status = 'OPEN'
        AND target.expires_at > NOW()
      ON CONFLICT (request_id, user_id) DO NOTHING
      RETURNING id, request_id, body, created_at
    )
    SELECT inserted.id, inserted.request_id, inserted.body, inserted.created_at,
           ${input.userId}::uuid AS author_id,
           (SELECT name FROM users WHERE id = ${input.userId}) AS author_name,
           (SELECT image FROM users WHERE id = ${input.userId}) AS author_image,
           0::int AS message_count,
           (SELECT user_id FROM target) AS request_author_id,
           EXISTS (SELECT 1 FROM target) AS request_exists,
           EXISTS (
             SELECT 1 FROM target
             WHERE status = 'OPEN' AND expires_at > NOW()
           ) AS request_is_open
    FROM (SELECT 1) AS anchor
    LEFT JOIN inserted ON TRUE
  `;
  if (!result.request_exists || !result.request_is_open) {
    throw new NotFoundError("This community post is no longer open");
  }
  if (result.request_author_id === input.userId) {
    throw new ForbiddenError("You cannot respond to your own community post");
  }
  if (!result.id) throw new ConflictError("You have already responded to this community post");
  return toResponse(result);
}

export async function getCommunityRequestResponses(
  requestId: string,
  userId: string,
): Promise<CommunityRequestResponse[]> {
  const [request] = await sql<{ user_id: string }[]>`
    SELECT user_id FROM community_requests WHERE id = ${requestId}
  `;
  if (!request) throw new NotFoundError("Community request not found");
  if (request.user_id !== userId) throw new ForbiddenError("Only the author can view private responses");

  const rows = await sql<CommunityRequestResponseRow[]>`
    SELECT response.id, response.request_id, response.body, response.created_at,
           author.id AS author_id, author.name AS author_name, author.image AS author_image,
           (SELECT COUNT(*)::int FROM community_response_messages message WHERE message.response_id = response.id) AS message_count
    FROM community_request_responses response
    JOIN users author ON author.id = response.user_id
    WHERE response.request_id = ${requestId}
    ORDER BY response.created_at ASC, response.id ASC
  `;
  return rows.map(toResponse);
}

export async function getCommunityResponseThread(responseId: string, userId: string): Promise<CommunityResponseThread> {
  const [response] = await sql<
    Array<
      CommunityRequestResponseRow & {
        request_author_id: string;
        request_title: string;
      }
    >
  >`
    SELECT response.id, response.request_id, response.body, response.created_at,
           responder.id AS author_id, responder.name AS author_name, responder.image AS author_image,
           request.user_id AS request_author_id, request.title AS request_title,
           (SELECT COUNT(*)::int FROM community_response_messages message WHERE message.response_id = response.id) AS message_count
    FROM community_request_responses response
    JOIN community_requests request ON request.id = response.request_id
    JOIN users responder ON responder.id = response.user_id
    WHERE response.id = ${responseId}
  `;
  if (!response) throw new NotFoundError("Community response not found");
  const viewerIsPostAuthor = response.request_author_id === userId;
  if (!viewerIsPostAuthor && response.author_id !== userId) {
    throw new ForbiddenError("Only participants can view this private conversation");
  }

  const messages = await sql<CommunityResponseMessageRow[]>`
    SELECT id, sender_user_id, body, source, created_at
    FROM community_response_messages
    WHERE response_id = ${responseId}
    ORDER BY created_at ASC, id ASC
  `;
  return {
    messages: messages.map(toResponseMessage),
    requestTitle: response.request_title,
    response: toResponse(response),
    viewerIsPostAuthor,
  };
}

export async function createCommunityResponseMessage(input: {
  body: string;
  responseId: string;
  source?: "TELEGRAM" | "WEB";
  telegramChatId?: number;
  telegramMessageId?: number;
  userId: string;
}): Promise<CommunityResponseMessage> {
  const [response] = await sql<{ request_author_id: string; responder_id: string }[]>`
    SELECT request.user_id AS request_author_id, response.user_id AS responder_id
    FROM community_request_responses response
    JOIN community_requests request ON request.id = response.request_id
    WHERE response.id = ${input.responseId}
  `;
  if (!response) throw new NotFoundError("Community response not found");
  if (response.request_author_id !== input.userId && response.responder_id !== input.userId) {
    throw new ForbiddenError("Only participants can reply to this private conversation");
  }
  const source = input.source ?? "WEB";
  const [message] = await sql<CommunityResponseMessageRow[]>`
    INSERT INTO community_response_messages (
      response_id, sender_user_id, body, source, telegram_chat_id, telegram_message_id
    ) VALUES (
      ${input.responseId}, ${input.userId}, ${input.body}, ${source},
      ${source === "TELEGRAM" ? (input.telegramChatId ?? null) : null},
      ${source === "TELEGRAM" ? (input.telegramMessageId ?? null) : null}
    )
    ON CONFLICT (telegram_chat_id, telegram_message_id)
      WHERE telegram_chat_id IS NOT NULL AND telegram_message_id IS NOT NULL
      DO NOTHING
    RETURNING id, sender_user_id, body, source, created_at
  `;
  if (!message) throw new ConflictError("This Telegram reply has already been received");
  return toResponseMessage(message);
}

export async function closeCommunityRequest(id: string, userId: string): Promise<void> {
  const [request] = await sql<{ user_id: string }[]>`
    SELECT user_id FROM community_requests WHERE id = ${id}
  `;
  if (!request) throw new NotFoundError("Community request not found");
  if (request.user_id !== userId) throw new ForbiddenError("Only the author can close this request");

  await sql`
    UPDATE community_requests SET status = 'CLOSED' WHERE id = ${id} AND user_id = ${userId}
  `;
}

async function validateRelatedContent(relatedVenueId: null | string, relatedEventId: null | string) {
  if (relatedVenueId && relatedEventId) throw new ForbiddenError("Choose one related venue or event");
  if (relatedVenueId) {
    const [venue] = await sql<{ id: string }[]>`
      SELECT id FROM venues WHERE id = ${relatedVenueId} AND status = 'ACTIVE'
    `;
    if (!venue) throw new NotFoundError("The selected venue is no longer available");
  }
  if (relatedEventId) {
    const [event] = await sql<{ id: string }[]>`
      SELECT id FROM events WHERE id = ${relatedEventId} AND status = 'ACTIVE'
    `;
    if (!event) throw new NotFoundError("The selected event is no longer available");
  }
}

export async function updateCommunityRequest(input: {
  body: string;
  category: CommunityRequestCategory;
  country: string;
  expiresAt: Date;
  id: string;
  kind: CommunityRequestKind;
  location: null | string;
  relatedEventId: null | string;
  relatedVenueId: null | string;
  title: string;
  userId: string;
}): Promise<CommunityRequest> {
  await validateRelatedContent(input.relatedVenueId, input.relatedEventId);
  const [row] = await sql<CommunityRequestRow[]>`
    UPDATE community_requests request
    SET kind = ${input.kind}, category = ${input.category}, title = ${input.title}, body = ${input.body},
        country = ${input.country}, location = ${input.location}, venue_id = ${input.relatedVenueId}, event_id = ${input.relatedEventId},
        expires_at = ${input.expiresAt}
    WHERE request.id = ${input.id} AND request.user_id = ${input.userId} AND request.status = 'OPEN' AND request.expires_at > NOW()
    RETURNING request.id, request.kind, request.category, request.title, request.body, request.country, request.location,
      request.status, request.expires_at, request.created_at,
      ${input.userId}::uuid AS author_id,
      (SELECT name FROM users WHERE id = ${input.userId}) AS author_name,
      (SELECT image FROM users WHERE id = ${input.userId}) AS author_image,
      (SELECT id FROM venues WHERE id = request.venue_id) AS related_venue_id,
      (SELECT name FROM venues WHERE id = request.venue_id) AS related_venue_name,
      (SELECT slug FROM venues WHERE id = request.venue_id) AS related_venue_slug,
      (SELECT id FROM events WHERE id = request.event_id) AS related_event_id,
      (SELECT COALESCE(title_en, title_uk) FROM events WHERE id = request.event_id) AS related_event_name,
      (SELECT slug FROM events WHERE id = request.event_id) AS related_event_slug,
      (
        SELECT COUNT(*)::int
        FROM community_request_responses response
        WHERE response.request_id = request.id
      ) AS response_count,
      0::int AS location_rank,
      NULL::uuid AS viewer_response_id
  `;
  if (!row) throw new NotFoundError("This community post is no longer available to edit");
  return toCommunityRequest(row);
}
