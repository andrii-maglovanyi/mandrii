import { getCronAuthorizationError } from "~/lib/cron/authorization";
import { deliverPendingReviewTelegramNotifications, deliverPendingTelegramMessages } from "~/lib/telegram/bot";

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  const authorizationError = getCronAuthorizationError(req.headers.get("authorization"));
  if (authorizationError) return authorizationError;

  try {
    const [messages, reviews] = await Promise.all([
      deliverPendingTelegramMessages(),
      deliverPendingReviewTelegramNotifications(),
    ]);
    return Response.json({ messages, reviews });
  } catch (error) {
    console.error("Telegram delivery cron failed:", error);
    return new Response("Unable to process Telegram deliveries", { status: 500 });
  }
};
