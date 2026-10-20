# MOME

MOME is a mobile-first web prototype for turning real memories into printable physical-journal sticker sheets. The UI follows the supplied Figma design and uses the supplied SVG character states.

## Product flow

1. Start a fresh exploration and choose or type a memory-search intent.
2. Import up to 200 real JPEG, PNG, or WebP photos from the system photo picker.
3. Gemini analyzes photos in batches of 12 with at most two requests in flight.
4. The Mome cursor visibly reviews the first 12 results, then uses a faster review rhythm. Pause, resume, skip, and stop remain available.
5. Confirm up to five subjects and choose one of four exact art styles.
6. One server-side image-generation request creates one color PNG sheet at 1:4 and 2K, laid out for a logical 58 mm print width.
7. Download PNG/JPG or save the completed sheet in My Little Collection. Raspberry Pi Wi-Fi printing is a labelled placeholder only.

## AI boundaries

- Photo exploration and chat use the existing Gemini server routes.
- Sticker-sheet generation uses `POST /api/gemini/generate-material-sheet` and `gemini-nano-banana-2.1`.
- The generation route accepts 1–5 subjects and 1–5 matching reference images.
- The generation identity is `creationSessionId + subjectVersion + styleId`; duplicate clicks share one job.
- Generation has no automatic retry, fallback model, mock image, or `LocalMaterialProvider` fallback.
- `GEMINI_API_KEY` is read only by `server.ts`; it is never shipped to the browser.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
```

Copy `.env.example` to `.env.local`, then set:

```text
GEMINI_API_KEY=your_server_side_key
```

Start the app:

```bash
npm run dev
```

The server defaults to port 3000. A hosting platform may supply `PORT`.

## Verify

```bash
npm run test:run
npm run lint
npm run build
```

`GET /api/health` confirms whether the server can see a Gemini key without exposing it.

## Google AI Studio / GitHub

Push this folder to GitHub, import that repository into Google AI Studio, then create a Secret named `GEMINI_API_KEY`. Do not commit `.env`, generated photos, IndexedDB data, or API keys. AI Studio Preview WebSocket/HMR warnings can be ignored when the application itself loads normally.

## Future printer bridge

The result page intentionally does not contact a printer yet. The later cloud bridge should expose authenticated endpoints to create a print job, let the Raspberry Pi claim it over Wi-Fi, and report printing status. The generated 58 mm PNG is already the handoff artifact for that phase.
