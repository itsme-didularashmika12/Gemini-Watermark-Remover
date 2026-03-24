# Telegram Netlify Bot Starter

This repository is now structured as a **Telegram bot webhook** project designed for deployment on the **Netlify free plan**.

## What it does

- Receives Telegram webhook updates through a Netlify Function.
- Verifies requests with Telegram's webhook secret header.
- Handles `/start` and image messages.
- Echoes uploaded images back to the user to confirm bot + webhook setup.
- Includes a helper function to register the webhook.

## Project structure

- `netlify/functions/telegram-webhook.mjs` → Main Telegram update handler.
- `netlify/functions/set-webhook.mjs` → Helper endpoint that calls Telegram `setWebhook`.
- `netlify.toml` → Functions directory and pretty webhook route redirect.
- `package.json` → Node metadata and syntax-check command.

## Deploy on Netlify (Free Plan)

1. Push this repository to GitHub.
2. In Netlify, create a new site from your GitHub repo.
3. Set these environment variables in **Site configuration → Environment variables**:
   - `TELEGRAM_BOT_TOKEN` (from BotFather)
   - `TELEGRAM_WEBHOOK_SECRET` (any long random string)
   - `NETLIFY_SITE_URL` (example: `https://your-site.netlify.app`)
4. Deploy.
5. Open this URL once to register webhook:
   - `https://your-site.netlify.app/.netlify/functions/set-webhook`
6. Send `/start` or an image to your bot in Telegram.

## Local checks

```bash
npm run check
```

## Notes

- This starter intentionally focuses on webhook infrastructure and bot wiring for Netlify.
- Add your own image-processing logic in `netlify/functions/telegram-webhook.mjs` where the photo handling branch exists.
