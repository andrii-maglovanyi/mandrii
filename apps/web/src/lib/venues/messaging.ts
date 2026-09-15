import sql from "~/lib/db/db";

type VenueMessagingState = {
  initialMessagingRole: "OWNER" | "USER" | null;
  initialTelegramLinked: boolean | null;
  initialTelegramReviewNotificationsEnabled: boolean | null;
};

/** Private preferences are loaded only for signed-in visitors and exposed only to the owner. */
export async function getVenueMessagingState(venueId: string, userId?: string): Promise<VenueMessagingState> {
  const unavailable: VenueMessagingState = {
    initialMessagingRole: null,
    initialTelegramLinked: null,
    initialTelegramReviewNotificationsEnabled: null,
  };
  if (!userId) return unavailable;

  const [venue] = await sql<
    {
      owner_id: null | string;
      telegram_linked: boolean;
      telegram_review_notifications_enabled: boolean;
    }[]
  >`
    SELECT owner_id,
      CASE WHEN owner_id = ${userId} THEN telegram_chat_id IS NOT NULL ELSE FALSE END AS telegram_linked,
      CASE WHEN owner_id = ${userId} THEN telegram_review_notifications_enabled ELSE FALSE END AS telegram_review_notifications_enabled
    FROM venues WHERE id = ${venueId}
  `;
  if (!venue?.owner_id) return unavailable;
  if (venue.owner_id !== userId) return { ...unavailable, initialMessagingRole: "USER" };
  return {
    initialMessagingRole: "OWNER",
    initialTelegramLinked: venue.telegram_linked,
    initialTelegramReviewNotificationsEnabled: venue.telegram_review_notifications_enabled,
  };
}
