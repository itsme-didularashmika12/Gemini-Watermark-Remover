const TELEGRAM_API = "https://api.telegram.org";

async function telegramRequest(token, method, payload) {
  const response = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API error (${method}): ${response.status} ${errorText}`);
  }

  return response.json();
}

function extractMessage(update) {
  return update?.message ?? update?.edited_message ?? update?.channel_post ?? null;
}

export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token || !secret) {
    return new Response("Server is not configured", { status: 500 });
  }

  const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (incomingSecret !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response("Bad request payload", { status: 400 });
  }

  const message = extractMessage(update);
  if (!message?.chat?.id) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const chatId = message.chat.id;
  const text = message.text?.trim() ?? "";

  try {
    if (text === "/start") {
      await telegramRequest(token, "sendMessage", {
        chat_id: chatId,
        text:
          "Hi! I am running on Netlify Functions. Send me a photo and I will echo it back so you can verify your webhook deployment.",
      });
    } else if (message.photo?.length) {
      const largestPhoto = message.photo[message.photo.length - 1];
      await telegramRequest(token, "sendPhoto", {
        chat_id: chatId,
        photo: largestPhoto.file_id,
        caption:
          "Webhook is working ✅\n\nI can receive and return images on Netlify free plan. Add your own processing logic inside netlify/functions/telegram-webhook.mjs.",
      });
    } else {
      await telegramRequest(token, "sendMessage", {
        chat_id: chatId,
        text:
          "Send /start or send an image. This starter bot is ready for Netlify free-plan webhook deployment.",
      });
    }
  } catch (error) {
    console.error(error);
    return new Response("Telegram call failed", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
