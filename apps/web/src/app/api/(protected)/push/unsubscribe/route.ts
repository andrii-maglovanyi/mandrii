import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const schema = z.object({ endpoint: z.url() });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { endpoint } = await validateRequest(req, schema);

    await sql`
      WITH removed_subscription AS (
        DELETE FROM push_subscriptions
        WHERE endpoint = ${endpoint} AND user_id = ${session.user.id}
        RETURNING user_id
      ), disabled_content_push AS (
        UPDATE users user_account
        SET content_alert_push_notifications_enabled = false
        FROM removed_subscription
        WHERE user_account.id = removed_subscription.user_id
          AND user_account.content_alert_push_notifications_enabled
          -- A person can have several devices. Removing one subscription must
          -- not switch off follower alerts on the devices that remain.
          -- Data-modifying CTEs share a snapshot, so exclude the endpoint being
          -- removed rather than relying on this statement to see its deletion.
          AND NOT EXISTS (
            SELECT 1
            FROM push_subscriptions subscription
            WHERE subscription.user_id = user_account.id
              AND subscription.endpoint <> ${endpoint}
          )
        RETURNING user_account.id
      )
      UPDATE content_subscription_alert_deliveries delivery
      SET status = 'CANCELLED', locked_at = NULL
      WHERE delivery.channel = 'WEB_PUSH'
        AND delivery.status IN ('PENDING', 'PROCESSING')
        AND delivery.recipient_id IN (SELECT id FROM disabled_content_push)
    `;

    return Response.json({ unsubscribed: true });
  });
