import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { getConversationForUser } from "~/lib/messaging/conversation-access";

export const dynamic = "force-dynamic";

const archiveSchema = z.object({ archived: z.boolean() });

export const PATCH = (req: Request, { params }: { params: Promise<{ conversationId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { conversationId } = await params;
    const { archived } = await validateRequest(req, archiveSchema);
    const conversation = await getConversationForUser(conversationId, session.user.id);

    const [updatedConversation] = conversation.is_owner
      ? await sql<Array<{ archived_at: null | string }>>`
          UPDATE conversations
          SET owner_archived_at = CASE WHEN ${archived} THEN NOW() ELSE NULL END,
              owner_last_read_at = CASE WHEN ${archived} THEN NOW() ELSE owner_last_read_at END
          WHERE id = ${conversationId}
          RETURNING owner_archived_at AS archived_at
        `
      : await sql<Array<{ archived_at: null | string }>>`
          UPDATE conversations
          SET user_archived_at = CASE WHEN ${archived} THEN NOW() ELSE NULL END,
              user_last_read_at = CASE WHEN ${archived} THEN NOW() ELSE user_last_read_at END
          WHERE id = ${conversationId}
          RETURNING user_archived_at AS archived_at
        `;

    return Response.json({ conversation: updatedConversation });
  });
