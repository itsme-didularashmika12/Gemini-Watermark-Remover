# ✨ Gemini Watermark Removal System

<p align="center">
  <img src="assets/apple-touch-icon.png" width="128" height="128" alt="Gemini Watermark Removal Logo">
</p>

<p align="center">
  <strong>The ultimate automated solution for cleaning AI-generated artwork.</strong><br>
  Built with privacy and performance in mind using Puppeteer & Express.
</p>

---

## 📸 Before and After

| Before Removal | After Removal |
| :---: | :---: |
| ![Original Image](assets/Gemini_Generated_Image_Sample_Reduced_Size.jpg) | ![Processed Image](assets/Gemini_Generated_Image_Sample_no_watermark_Reduced_Size.jpg) |
| *Original Gemini Image with Watermark* | *Cleaned High-Resolution Version* |

---

## 🚀 Features

- **Double Input Mode**: Support for direct image URLs and binary file uploads.
- **Privacy First**: Local browser-based processing (via Puppeteer headlessly).
- **Stealth Extraction**: Bypasses bot detection on major image hosting platforms.
- **Automatic Optimization**: Specifically tuned for Google User Content (`=s0`) scaling.
- **Auto-Cleanup**: Temporary and output files are automatically purged every 15 minutes.

---

## 📡 API Documentation

Access the live tester at: `https://gemini-watermark-remover-codex.netlify.app/api`

### 1. URL Interface (GET/POST)
Clean images using a publicly accessible link.

**Endpoint:** `/api/remove`
**Method:** `GET` | `POST`
**Parameter:** `url` (String)

**Sample JSON Response:**
```json
{
  "status": "success",
  "download_url": "https://gemini-watermark-remover-codex.netlify.app/download/63e1_processed.png",
  "expiry": "15 minutes",
  "creator": "Kawdhitha Nirmal",
  "team": "Cyber yakku | Codex Developers"
}
```

### 2. File Interface (POST)
Upload a raw image file directly.

**Endpoint:** `/api/upload`
**Method:** `POST`
**Body:** `multipart/form-data`
**Field:** `image` (Binary File)

---

## 🛠️ Installation & Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Start the Server**:
```bash
npm start
```

3. **Access the Tool**:
Navigate to `https://gemini-watermark-remover-codex.netlify.app`

---

## 👤 Developer Credits

- **Lead Developer**: **Kawdhitha Nirmal**
- **Engineering Team**: **Cyber yakku | Codex Developers**

---

<p align="center">
  &copy; 2026 Gemini Watermark Removal Engine. All rights reserved.
</p>
