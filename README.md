# Scribe Clone

A ScribeHow clone. Click anything on any webpage to auto-capture screenshots, draw highlight annotations, and export guides as PDF, DOCX, or PPTX.

## Structure

```
scribe-clone/
├── extension/          ← Chrome Extension (load unpacked)
│   ├── manifest.json
│   ├── background.js   ← screenshot capture (chrome.tabs.captureVisibleTab)
│   ├── content.js      ← click listener injected into every page
│   ├── popup.html      ← extension popup UI
│   ├── popup.js        ← annotation canvas + step management
│   └── icons/          ← add icon16.png, icon48.png, icon128.png
│
├── web/                ← Next.js web app
│   ├── src/app/
│   │   ├── page.tsx              ← dashboard (list guides)
│   │   ├── guide/[id]/page.tsx   ← guide editor / viewer
│   │   └── api/
│   │       ├── export/pptx/      ← server-side PPTX via pptxgenjs
│   │       └── export/docx/      ← server-side DOCX via docx
│   ├── supabase-schema.sql       ← run in Supabase SQL editor
│   └── package.json
│
└── CLAUDE.md           ← instructions for Claude Code
```

## Setup

### 1. Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `/extension` folder
5. Pin the Scribe extension to your toolbar

> Add placeholder icons: create 3 PNG files named `icon16.png`, `icon48.png`, `icon128.png` in `/extension/icons/`. Any image works for dev.

### 2. Web App

```bash
cd web
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Open http://localhost:3000

### 3. Supabase

1. Create a new Supabase project at supabase.com
2. Go to SQL Editor
3. Paste and run `web/supabase-schema.sql`
4. Copy your project URL and anon key into `web/.env.local`

### 4. env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## How it works

1. Click the Scribe extension icon → enter a guide title → **Start recording**
2. A red banner appears on the page: "Recording — click anything"
3. **Click any element** on the page → screenshot is captured instantly
4. The **annotation modal** appears — drag to draw a highlight box on the screenshot
5. Press **Save step** → step is added with your highlight baked in
6. Repeat for each step
7. Press **Stop recording** → export to PDF, Word, DOCX, or PPTX

### Video recording

1. Open the PinCapture side panel and click **Start video**.
2. Choose the tab, window, or screen to share.
3. Record for up to 10 minutes, then click **Stop video**.
4. PinCapture records a genuine MP4 file, uploads it in resumable 6 MiB chunks, and shows progress. A current Chrome version with MP4 MediaRecorder support is required.
5. After the upload finishes, click **Finish and save to dashboard**.

## Deploy

```bash
cd web
vercel deploy
```

## Extend

- Add AI step descriptions: call Claude API with the screenshot + element label
- Longer or higher-resolution video: move the Supabase project to a paid plan and raise both global and `captures` bucket file limits
- Team sharing: add org_id to guides table + invite system
- Embed in Notion/Confluence: generate an iframe-embeddable viewer route
