import { getApiContext, rateLimiters, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    await sql`
      WITH target AS (
        SELECT id, telegram_chat_id FROM users WHERE id = ${session.user.id} FOR UPDATE
      ), unlinked_user AS (
        UPDATE users user_account
        SET telegram_chat_id = NULL,
            telegram_user_id = NULL,
            community_telegram_notifications_enabled = false
        FROM target
        WHERE user_account.id = target.id
        RETURNING target.id, target.telegram_chat_id
      ), cancelled_deliveries AS (
        UPDATE community_response_telegram_deliveries delivery
        SET status = 'CANCELLED', locked_at = NULL
        WHERE delivery.status IN ('PENDING', 'PROCESSING')
          AND delivery.telegram_chat_id = (SELECT telegram_chat_id FROM unlinked_user)
      )
      UPDATE telegram_link_tokens
      SET used_at = NOW()
      WHERE user_id = ${session.user.id} AND used_at IS NULL
    `;
    return Response.json({ linked: false });
  });
