import sql from "~/lib/db/db";

export type LatestUnreadConversation = {
  conversation_id: string;
  sender_name: string;
  venue_slug: string;
};

export async function getUnreadMessagingState(userId: string) {
  const [result] = await sql<
    Array<{
      latest_conversation_id: null | string;
      latest_sender_name: null | string;
      latest_venue_slug: null | string;
      unread_count: number | string;
    }>
  >`
    WITH unread_messages AS MATERIALIZED (
      SELECT m.id, c.id AS conversation_id, COALESCE(u.name, 'Customer') AS sender_name, v.slug AS venue_slug, m.created_at
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN venues v ON v.id = c.venue_id
      LEFT JOIN users u ON u.id = c.user_id
      WHERE v.owner_id = ${userId} AND m.sender_type = 'USER'
        AND m.deleted_at IS NULL
        AND m.created_at > COALESCE(c.owner_last_read_at, c.created_at)

      UNION ALL

      SELECT m.id, c.id AS conversation_id, v.name AS sender_name, v.slug AS venue_slug, m.created_at
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN venues v ON v.id = c.venue_id
      WHERE c.user_id = ${userId} AND v.owner_id IS NOT NULL AND v.owner_id IS DISTINCT FROM ${userId}
        AND m.sender_type = 'VENUE'
        AND m.deleted_at IS NULL
        AND m.created_at > COALESCE(c.user_last_read_at, c.created_at)
    )
    SELECT
      COUNT(*) AS unread_count,
      (SELECT conversation_id FROM unread_messages ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_conversation_id,
      (SELECT sender_name FROM unread_messages ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_sender_name,
      (SELECT venue_slug FROM unread_messages ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_venue_slug
    FROM unread_messages
  `;

  const latest = result?.latest_conversation_id
    ? {
        conversation_id: result.latest_conversation_id,
        sender_name: result.latest_sender_name || "Venue",
        venue_slug: result.latest_venue_slug || "",
      }
    : null;

  return { latest, unreadCount: Number(result?.unread_count ?? 0) };
}
