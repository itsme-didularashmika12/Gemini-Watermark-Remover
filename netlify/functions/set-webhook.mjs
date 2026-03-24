const TELEGRAM_API = "https://api.telegram.org";

export default async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const siteUrl = process.env.NETLIFY_SITE_URL;

  if (!token || !secret || !siteUrl) {
    return new Response(
      "Missing TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, or NETLIFY_SITE_URL",
      { status: 500 },
    );
  }

  const webhookUrl = `${siteUrl.replace(/\/$/, "")}/telegram-webhook`;
  const response = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "edited_message", "channel_post", "document"],
    }),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data, null, 2), {
    status: response.ok ? 200 : 500,
    headers: { "content-type": "application/json" },
  });
};
