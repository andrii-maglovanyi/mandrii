const botToken = process.env.TELEGRAM_BOT_TOKEN;
const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

if (!botToken || !secretToken || !webhookUrl) {
  throw new Error("TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, and TELEGRAM_WEBHOOK_URL are required");
}

const url = new URL(webhookUrl);
if (url.protocol !== "https:") {
  throw new Error("TELEGRAM_WEBHOOK_URL must use HTTPS");
}

const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
  body: JSON.stringify({
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: false,
    secret_token: secretToken,
    url: url.toString(),
  }),
  headers: { "Content-Type": "application/json" },
  method: "POST",
});
const result = await response.json();

if (!response.ok || !result.ok) {
  throw new Error(result.description || "Telegram webhook registration failed");
}

console.log(`Telegram webhook registered for ${url.toString()}`);
