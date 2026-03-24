import { GoogleGenAI } from "@google/genai";

const TELEGRAM_API = "https://api.telegram.org";
const ai = new GoogleGenAI({});

async function telegramRequest(token, method, payload) {
  const response = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Telegram API error (${method}): ${response.status} ${errorText}`,
    );
  }

  return response.json();
}

async function downloadTelegramFile(token, fileId) {
  const fileInfo = await telegramRequest(token, "getFile", {
    file_id: fileId,
  });
  const filePath = fileInfo.result.file_path;

  const response = await fetch(`${TELEGRAM_API}/file/bot${token}/${filePath}`);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function removeWatermark(imageBuffer) {
  const base64Image = imageBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Remove the small sparkle/star watermark icon from the bottom-right corner of this image. Keep everything else in the image exactly the same. Return only the edited image.",
          },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("No response from AI model");
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("AI model did not return an image");
}

async function sendPhoto(token, chatId, imageBuffer, caption) {
  const formData = new FormData();
  formData.append("chat_id", chatId.toString());
  formData.append(
    "photo",
    new Blob([imageBuffer], { type: "image/png" }),
    "cleaned.png",
  );
  if (caption) {
    formData.append("caption", caption);
  }

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendPhoto`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send photo: ${response.status} ${errorText}`);
  }

  return response.json();
}

function extractMessage(update) {
  return (
    update?.message ?? update?.edited_message ?? update?.channel_post ?? null
  );
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

  const incomingSecret = request.headers.get(
    "x-telegram-bot-api-secret-token",
  );
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
        text: "Welcome to the Gemini Watermark Remover Bot!\n\nSend me an image with a Gemini AI watermark (the sparkle icon) and I'll remove it for you.\n\nJust send a photo to get started!",
      });
    } else if (message.photo?.length) {
      await telegramRequest(token, "sendMessage", {
        chat_id: chatId,
        text: "Processing your image... This may take a moment.",
      });

      const largestPhoto = message.photo[message.photo.length - 1];
      const imageBuffer = await downloadTelegramFile(
        token,
        largestPhoto.file_id,
      );
      const cleanedImage = await removeWatermark(imageBuffer);
      await sendPhoto(
        token,
        chatId,
        cleanedImage,
        "Watermark removed successfully!",
      );
    } else if (message.document?.mime_type?.startsWith("image/")) {
      await telegramRequest(token, "sendMessage", {
        chat_id: chatId,
        text: "Processing your image... This may take a moment.",
      });

      const imageBuffer = await downloadTelegramFile(
        token,
        message.document.file_id,
      );
      const cleanedImage = await removeWatermark(imageBuffer);
      await sendPhoto(
        token,
        chatId,
        cleanedImage,
        "Watermark removed successfully!",
      );
    } else {
      await telegramRequest(token, "sendMessage", {
        chat_id: chatId,
        text: "Please send me a photo with a Gemini watermark and I'll remove it for you.\n\nUse /start to see the welcome message.",
      });
    }
  } catch (error) {
    console.error("Processing error:", error);
    try {
      await telegramRequest(token, "sendMessage", {
        chat_id: chatId,
        text: "Sorry, something went wrong while processing your image. Please try again with a different image.",
      });
    } catch (notifyError) {
      console.error("Failed to notify user:", notifyError);
    }
    return new Response("Processing failed", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
