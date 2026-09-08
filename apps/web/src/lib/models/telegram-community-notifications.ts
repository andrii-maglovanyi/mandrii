import sql from "~/lib/db/db";

export type TelegramCommunityNotificationPreferences = {
  enabled: boolean;
  linked: boolean;
};

export async function getTelegramCommunityNotificationPreferences(
  userId: string,
): Promise<TelegramCommunityNotificationPreferences> {
  const [user] = await sql<TelegramCommunityNotificationPreferences[]>`
    SELECT community_telegram_notifications_enabled AS enabled,
           telegram_chat_id IS NOT NULL AND telegram_user_id IS NOT NULL AS linked
    FROM users
    WHERE id = ${userId}
  `;
  return user ?? { enabled: false, linked: false };
}
