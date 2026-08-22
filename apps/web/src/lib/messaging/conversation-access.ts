import { z } from "zod";

import { BadRequestError, ForbiddenError } from "~/lib/api";
import sql from "~/lib/db/db";

export type MessagingConversationAccess = {
  id: string;
  is_owner: boolean;
  user_id: string;
  venue_id: string;
};

export async function getConversationForUser(conversationId: string, userId: string) {
  if (!z.uuid().safeParse(conversationId).success) {
    throw new BadRequestError("A valid conversation ID is required");
  }

  const [conversation] = await sql<MessagingConversationAccess[]>`
    SELECT c.id, c.venue_id, c.user_id, (v.owner_id = ${userId}) AS is_owner
    FROM conversations c
    JOIN venues v ON v.id = c.venue_id
    WHERE c.id = ${conversationId}
      AND v.owner_id IS NOT NULL
      AND (c.user_id = ${userId} OR v.owner_id = ${userId})
  `;
  if (!conversation) throw new ForbiddenError("You do not have access to this conversation");

  return conversation;
}
