# Scribe Clone — Claude Code Instructions

## What this is
A ScribeHow clone. Two parts:
1. **Chrome Extension** (`/extension`) — captures clicks on any webpage, takes screenshots, lets user draw highlight annotations on each screenshot
2. **Web App** (`/web`) — Next.js app that stores guides, renders step viewers, and exports to PDF/DOCX/PPTX

## Architecture
- Extension sends captured steps (screenshot + annotation rect) to the web app via `postMessage` or direct Supabase insert
- Web app stores guides in Supabase (`guides` + `steps` tables)
- Exports handled server-side: PDF via `@react-pdf/renderer`, DOCX via `docx`, PPTX via `pptxgenjs`

## Stack
- Chrome Extension: Manifest V3, vanilla JS (no framework)
- Web: Next.js 14 (App Router), TypeScript, Tailwind CSS
- DB: Supabase
- Export: pptxgenjs, docx, @react-pdf/renderer
- Deploy: Vercel

## Key behaviours
- Click capture: content script listens to clicks with `capture:true`, calls `chrome.tabs.captureVisibleTab()` from background service worker
- Annotation: user draws a rect on the screenshot canvas before saving the step
- Each step = { title, description, type, screenshotDataUrl, annotationRect }

## Commands
- `cd web && npm run dev` — start web app
- `cd web && npm run build` — build for Vercel
- Load extension: Chrome → Extensions → Load unpacked → select `/extension`

## Env vars needed (web/.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
