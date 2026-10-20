# MOME Figma Dual-Agent Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the imported prototype's fragmented UI with the approved Figma mobile flow while preserving the real Gemini photo-analysis, chat, image-generation, and IndexedDB capabilities.

**Architecture:** Build a focused `src/features/mome` application shell and route all product state through one typed session reducer/repository. Keep Memory Explorer and Material Generation as independent clients and queues behind the existing Express server, and migrate only verified services from the old prototype. The runtime UI uses real React controls plus the supplied animated SVG assets; page PNG/SVG files remain visual references.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Motion 12, Express 4, `@google/genai` 2.4, IndexedDB, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-20-mome-figma-dual-agent-design.md`

## Global Constraints

- Support 1–200 imported photos; reject photo 201+ without crashing or issuing analysis requests for rejected files.
- Analyze in batches of 10–12 with at most two concurrent requests.
- Show full visual review for the first 12 photos and configurable fast review from photo 13 onward.
- Never place `GEMINI_API_KEY` in client code or log image Base64/API keys.
- Memory Explorer and Material Generation state, errors, and cancellation remain independent.
- No more than five subjects or five reference images may reach material generation.
- Style selection never calls image generation; final confirmation creates exactly one 1:4 2K sheet request.
- Image generation has no automatic retry, model fallback, local provider, or mock-image fallback.
- `Print it` is placeholder-only and must not create or upload a print task.
- Screen 03 is intentionally removed; mobile photo selection requires a direct second user click on `Choose photos`.
- Respect mobile safe areas and `prefers-reduced-motion`.
- Preserve the existing analysis and chat routes while changing their contracts only through backward-compatible optional fields.

## Review Focus

- **Oversized import:** selecting 201–500 files accepts exactly 200, reports the remainder, and never queues rejected files; pinned in Task 5.
- **Duplicate paid action:** double-click, rerender, or refresh during generation produces one request for the same task identity; pinned in Tasks 8 and 9.
- **Picker cancellation:** cancelling after selecting a recommendation stays on screen 02 and sends no analysis request; pinned in Task 4.
- **Partial batch failure:** completed analysis batches remain visible and only failed batches become retryable; pinned in Task 6.
- **Storage pressure:** IndexedDB quota failure is surfaced truthfully while the current in-memory session remains usable; pinned in Task 3.

---

## Planned File Structure

New product code lives under `src/features/mome` so old prototype pages remain reference material but are not reachable from the new root.

- `src/features/mome/MomeApp.tsx` — product composition and screen selection.
- `src/features/mome/domain.ts` — all new screen, session, suggestion, generation, and error types.
- `src/features/mome/state/momeReducer.ts` — deterministic workflow transitions.
- `src/features/mome/state/useMomeSession.ts` — persistence-aware orchestration.
- `src/features/mome/storage/momeRepository.ts` — focused IndexedDB persistence.
- `src/features/mome/design/tokens.ts` — Figma-derived tokens and asset manifest.
- `src/features/mome/config/animation.ts` — the only source of Agent timing values.
- `src/features/mome/components/*` — mobile shell, Agent, bubble, navigation, photo cards, dialogs.
- `src/features/mome/pages/*` — one focused component per approved screen/state.
- `src/features/mome/services/*` — onboarding, import, analysis, and generation clients.
- `src/features/mome/review/*` — batch scheduler and abortable visual-review player.
- `src/server/mome/*` — testable validation, prompt, and idempotency helpers used by `server.ts`.
- `src/assets/agent/*` — normalized copies of the seven supplied Agent SVG assets.
- `src/features/mome/**/*.test.ts(x)` — colocated unit/component tests.

Old pages and services are not deleted until the new root passes the complete acceptance suite. They become unreachable when `src/App.tsx` switches to `MomeApp`.

---

### Task 1: Recovery Baseline and Test Harness

**Files:**
- Create: `.gitignore`
- Modify: `package.json`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`
- Generated: `package-lock.json`

**Interfaces:**
- Consumes: imported ZIP contents with no Git metadata.
- Produces: reproducible dependency lock, `npm test`, and a recoverable Git baseline for every later task.

- [ ] **Step 1: Establish the recovery baseline**

Initialize Git on branch `main`, add a `.gitignore` covering `node_modules/`, `dist/`, `.env*` except `.env.example`, coverage, and editor artifacts, then commit the unmodified imported source plus approved design/plan documents as `chore: establish imported prototype baseline`.

- [ ] **Step 2: Add the failing smoke test and test dependencies**

Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` as dev dependencies; add scripts `test`, `test:run`, and `test:coverage`. Create `src/test/smoke.test.ts` asserting the test environment exposes `document` and can render a minimal React node.

- [ ] **Step 3: Run the test before configuration**

Run: `npm run test:run -- src/test/smoke.test.ts`  
Expected: FAIL because the jsdom/setup configuration is not present.

- [ ] **Step 4: Configure Vitest minimally**

Configure the existing `vite.config.ts` with `test.environment = 'jsdom'`, `setupFiles = ['./src/test/setup.ts']`, and globals/types required by TypeScript. Import `@testing-library/jest-dom/vitest` in setup.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/test/smoke.test.ts && npm run lint && npm run build`  
Expected: one passing test, TypeScript exit 0, Vite build exit 0.  
Commit: `test: add frontend verification harness`.

---

### Task 2: Figma Tokens and Agent Asset System

**Files:**
- Create: `src/assets/agent/main-unimpressed.svg`
- Create: `src/assets/agent/standby-scared.svg`
- Create: `src/assets/agent/review-thinking.svg`
- Create: `src/assets/agent/review-describing.svg`
- Create: `src/assets/agent/review-mismatch.svg`
- Create: `src/assets/agent/review-match.svg`
- Create: `src/assets/agent/bubble.svg`
- Create: `src/features/mome/design/tokens.ts`
- Create: `src/features/mome/design/agentAssets.ts`
- Create: `src/features/mome/design/agentAssets.test.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Figma file `SHc8FluIjRIlVrRwNvjq1J`, approved screen frames, and source SVGs under `../软件/agent 动画svg/`.
- Produces: `MOME_TOKENS`, `AgentVisualState`, and `AGENT_ASSET_BY_STATE` for all UI tasks.

- [ ] **Step 1: Inspect implementation frames before coding**

Load the Figma design-to-code guidance, call Figma design context for the approved screen frames, and record exact colors, spacing, type sizes, radii, shadows, and fixed/sticky behavior. Do not infer values from screenshots when design context provides them.

- [ ] **Step 2: Write the failing asset-manifest test**

Create tests asserting `AGENT_ASSET_BY_STATE` covers exactly `main`, `standby`, `thinking`, `describing`, `mismatch`, and `match`, and that every URL ends in `.svg`.

- [ ] **Step 3: Run the manifest test**

Run: `npm run test:run -- src/features/mome/design/agentAssets.test.ts`  
Expected: FAIL because the manifest does not exist.

- [ ] **Step 4: Copy and normalize the seven source SVG filenames**

Copy bytes unchanged from the supplied SVGs to the exact destinations above. Do not rasterize, rewrite, or inline the animated SVGs.

- [ ] **Step 5: Implement tokens and manifest**

Export `type AgentVisualState = 'main' | 'standby' | 'thinking' | 'describing' | 'mismatch' | 'match'` and `const AGENT_ASSET_BY_STATE: Record<AgentVisualState, string>`. Export typed Figma values through `MOME_TOKENS` and matching CSS custom properties.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:run -- src/features/mome/design/agentAssets.test.ts && npm run lint`  
Expected: all tests pass and TypeScript exit 0.  
Commit: `feat: add figma tokens and agent assets`.

---

### Task 3: Typed Session State and IndexedDB Repository

**Files:**
- Create: `src/features/mome/domain.ts`
- Create: `src/features/mome/state/momeReducer.ts`
- Create: `src/features/mome/state/momeReducer.test.ts`
- Create: `src/features/mome/storage/momeRepository.ts`
- Create: `src/features/mome/storage/momeRepository.test.ts`
- Create: `src/features/mome/state/useMomeSession.ts`

**Interfaces:**
- Consumes: `PhotoAsset`, `PhotoAnalysis`, `MaterialSheetSubject`, and `PrintableMaterialSheet` concepts from `src/domain/types.ts`.
- Produces: `MomeScreen`, `MomeSession`, `MomeAction`, `momeReducer(state, action)`, and `MomeRepository` used by every page.

- [ ] **Step 1: Define the failing reducer tests**

Cover these assertions: `START_NEW_EXPLORATION` creates a new ID and clears old photos; `BACK_WITHIN_FLOW` retains the session; `SELECT_SUGGESTION` stores query and acknowledgement; `SET_GENERATION_STATUS` cannot alter analysis state; and `COMPLETE_SHEET` makes the result library-eligible.

- [ ] **Step 2: Run reducer tests**

Run: `npm run test:run -- src/features/mome/state/momeReducer.test.ts`  
Expected: FAIL because types/reducer are absent.

- [ ] **Step 3: Implement domain types and reducer**

Define exact screens: `home | prompt | exploring | subjects | style | generating | result | singlePhoto | suggestions | ideas | library`. Define independent `analysis` and `generation` substates. Implement a pure reducer with exhaustive action checking.

- [ ] **Step 4: Verify reducer tests**

Run: `npm run test:run -- src/features/mome/state/momeReducer.test.ts`  
Expected: all reducer tests pass.

- [ ] **Step 5: Write repository tests**

Test save/load active session, Blob round-trip, promotion of a completed sheet to the library, fresh-session replacement, and quota-error mapping to `{ code: 'STORAGE_QUOTA', message }` while leaving the caller's in-memory object unchanged.

- [ ] **Step 6: Implement `MomeRepository`**

Expose `saveSession(session): Promise<void>`, `loadActiveSession(): Promise<MomeSession | null>`, `clearActiveSession(): Promise<void>`, `savePhoto(photo): Promise<void>`, and `saveLibrarySheet(sheet): Promise<void>`. Reuse the database/version migration style from `src/services/storage/repository.ts`, but create MOME-specific stores without deleting old stores.

- [ ] **Step 7: Add persistence-aware hook and verify**

Implement `useMomeSession()` to hydrate once, dispatch synchronously, debounce persistence, and surface repository errors without replacing current React state.  
Run: `npm run test:run -- src/features/mome/state src/features/mome/storage && npm run lint`  
Expected: all tests pass and TypeScript exit 0.  
Commit: `feat: add mome session state and persistence`.

---

### Task 4: Mobile Shell, Main View, and Gemini Prompt Entry

**Files:**
- Create: `src/features/mome/components/MobileShell.tsx`
- Create: `src/features/mome/components/MomeAgent.tsx`
- Create: `src/features/mome/components/AgentBubble.tsx`
- Create: `src/features/mome/components/MomeBottomNav.tsx`
- Create: `src/features/mome/pages/MainViewPage.tsx`
- Create: `src/features/mome/pages/PromptPage.tsx`
- Create: `src/features/mome/pages/PromptPage.test.tsx`
- Create: `src/features/mome/services/explorationPromptClient.ts`
- Create: `src/features/mome/MomeApp.tsx`
- Modify: `src/App.tsx`
- Modify: `server.ts`

**Interfaces:**
- Consumes: `useMomeSession`, Agent asset manifest, and the existing Gemini client in `server.ts`.
- Produces: `fetchExplorationPrompt(signal): Promise<ExplorationPrompt>`, Figma screens 01/02, and the new reachable application root.

- [ ] **Step 1: Write API contract tests around a pure response parser**

Test valid output with one greeting and 2–3 `{ id, label, query, acknowledgement }` suggestions; reject empty greetings, fewer than two suggestions, and oversized strings. Preserve old `/api/gemini/chat-agent` behavior for requests without `mode: 'onboarding'`.

- [ ] **Step 2: Implement backward-compatible onboarding mode**

Extend `POST /api/gemini/chat-agent` with optional `mode: 'onboarding'`. Use one Gemini call with structured JSON instructions; return interface copy only, never photo-analysis claims. Missing/failed Gemini returns a clearly defined neutral built-in welcome payload and no `isMock` analysis result.

- [ ] **Step 3: Write failing PromptPage interactions**

Assert one onboarding request per new session, cached suggestions on rerender, recommendation click displays its acknowledgement, `Choose photos` appears only after a query is selected/entered, and picker cancellation dispatches neither `IMPORT_PHOTOS` nor an analysis request.

- [ ] **Step 4: Run PromptPage tests**

Run: `npm run test:run -- src/features/mome/pages/PromptPage.test.tsx`  
Expected: FAIL because the page/client are absent.

- [ ] **Step 5: Build screens 01/02 and shell**

Implement the Figma layouts with real controls. `Choose photos` invokes a hidden `input[type=file][multiple][accept='image/jpeg,image/png,image/webp']` synchronously from its click handler. Do not add a fake keyboard screen.

- [ ] **Step 6: Switch the root without deleting legacy code**

Change `src/App.tsx` to render only `MomeApp`. Keep old pages unreferenced for recovery until final cleanup approval.

- [ ] **Step 7: Verify and commit**

Run: `npm run test:run -- src/features/mome/pages/PromptPage.test.tsx && npm run lint && npm run build`  
Expected: tests pass, TypeScript exit 0, build exit 0.  
Commit: `feat: build mome entry and prompt flow`.

---

### Task 5: Bounded 200-Photo Import and Responsive Grid

**Files:**
- Modify: `src/features/memory-explorer/pipeline.ts`
- Create: `src/features/mome/services/photoImport.ts`
- Create: `src/features/mome/services/photoImport.test.ts`
- Create: `src/features/mome/components/PhotoWaterfall.tsx`
- Create: `src/features/mome/components/PhotoCard.tsx`
- Create: `src/features/mome/pages/ExplorationPage.tsx`
- Create: `src/features/mome/pages/ExplorationPage.test.tsx`

**Interfaces:**
- Consumes: `FileList | File[]` from PromptPage and `MomeRepository.savePhoto`.
- Produces: `importPhotos(files, options): Promise<PhotoImportSummary>` and a two-column lazy photo grid with per-photo element registration.

- [ ] **Step 1: Write import-boundary tests**

Assert 0 files yields no session transition; 1, 5, 12, 50, and 200 valid files are accepted; 201 files returns `accepted.length === 200` and `rejected.length === 1`; unsupported MIME and files over 25 MB are rejected with reasons; processing concurrency never exceeds four.

- [ ] **Step 2: Run import tests**

Run: `npm run test:run -- src/features/mome/services/photoImport.test.ts`  
Expected: FAIL because the bounded importer is absent and legacy limit is 300.

- [ ] **Step 3: Implement bounded incremental import**

Set `MAX_PHOTO_SELECTION = 200`. Generate analysis images and thumbnails with object-URL cleanup. Do not retain Base64 for all photos. Persist incrementally so one corrupt file does not discard successful files.

- [ ] **Step 4: Write ExplorationPage tests**

Assert a 200-item result renders a two-column container with lazy images, announces rejected-count feedback, registers each mounted card through `registerPhotoElement(photoId, element)`, and keeps bottom controls accessible.

- [ ] **Step 5: Implement photo components**

Use `loading='lazy'`, `decoding='async'`, CSS `content-visibility`, and stable IDs. Avoid adding a large virtualization dependency unless profiling shows it is necessary.

- [ ] **Step 6: Verify and commit**

Run: `npm run test:run -- src/features/mome/services/photoImport.test.ts src/features/mome/pages/ExplorationPage.test.tsx && npm run lint`  
Expected: boundary and UI tests pass.  
Commit: `feat: add bounded 200 photo import`.

---

### Task 6: Batch Analysis and Configurable Visual Review

**Files:**
- Create: `src/features/mome/config/animation.ts`
- Create: `src/features/mome/review/batchScheduler.ts`
- Create: `src/features/mome/review/batchScheduler.test.ts`
- Create: `src/features/mome/review/visualReviewPlayer.ts`
- Create: `src/features/mome/review/visualReviewPlayer.test.ts`
- Create: `src/features/mome/components/FloatingMomeCursor.tsx`
- Modify: `src/features/mome/pages/ExplorationPage.tsx`
- Create: `src/features/mome/services/analysisClient.ts`

**Interfaces:**
- Consumes: imported photo analysis payloads and existing `POST /api/gemini/analyze-batch`.
- Produces: `runAnalysisBatches(input, options)`, `VisualReviewPlayer`, `ANIMATION_TIMING`, and revealed candidate events.

- [ ] **Step 1: Write scheduler failure/concurrency tests**

Assert batches contain 10–12 photos, active calls never exceed two, completed results survive a later batch failure, retry input contains only failed batch IDs, and abort stops unsent batches.

- [ ] **Step 2: Implement the scheduler and verify**

Run the failing test first, implement `runAnalysisBatches`, then rerun until all scheduler assertions pass.

- [ ] **Step 3: Write visual-player clock tests**

With fake timers, assert indices 0–11 use full travel/observe/think/reveal states, index 12 uses fast timing, pause freezes the index, resume continues it, skip reveals queued results immediately, and abort dispatches no later events.

- [ ] **Step 4: Implement centralized timing**

Export one immutable `ANIMATION_TIMING` object with `fullReviewCount: 12`, full/fast phase durations, and easing. Use `abortableDelay` rather than scattered `setTimeout` calls.

- [ ] **Step 5: Implement cursor positioning and card feedback**

Use fixed positioning, `scrollIntoView({ behavior: 'smooth', block: 'center' })`, card bounds, resize/scroll recalculation, and the four supplied state assets. Reduced-motion mode uses fades/state colors without long travel.

- [ ] **Step 6: Verify partial failures and commit**

Run: `npm run test:run -- src/features/mome/review src/features/mome/pages/ExplorationPage.test.tsx && npm run lint && npm run build`  
Expected: queue, partial-failure, pause/resume/skip, and build checks pass.  
Commit: `feat: add memory agent review queue`.

---

### Task 7: Five-Subject Confirmation and Style Presets

**Files:**
- Create: `src/features/mome/pages/SubjectSelectionPage.tsx`
- Create: `src/features/mome/pages/SubjectSelectionPage.test.tsx`
- Create: `src/features/mome/pages/StyleSelectionPage.tsx`
- Create: `src/features/mome/pages/StyleSelectionPage.test.tsx`
- Create: `src/features/mome/services/stylePresets.ts`
- Modify: `src/features/mome/MomeApp.tsx`

**Interfaces:**
- Consumes: revealed candidates and cached processed photo blobs.
- Produces: ordered `MaterialSubject[]` with 1–5 enabled entries and whitelisted `MaterialStyleId`.

- [ ] **Step 1: Write subject-selection tests**

Assert recommended candidates can exceed five, enabled selections cannot exceed five, replacing/reordering retains source photo IDs, and Next is disabled for 0 or more than 5 enabled subjects.

- [ ] **Step 2: Implement screen 05 and verify**

Build the Figma composition and subject controls; run the subject tests to passing.

- [ ] **Step 3: Write style-preset tests**

Assert exact IDs `printmaking`, `pixel-art`, `retro-manga-ink`, and `dreamy-anime`; selecting a style only dispatches local state; no fetch occurs before final confirmation.

- [ ] **Step 4: Implement screen 06 and style metadata**

Store display copy client-side but keep authoritative prompt fragments server-side. The confirm control displays the exact count and creates a generation intent only once.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/features/mome/pages/SubjectSelectionPage.test.tsx src/features/mome/pages/StyleSelectionPage.test.tsx && npm run lint`  
Expected: selection and no-early-fetch tests pass.  
Commit: `feat: add subject and style confirmation`.

---

### Task 8: Safe Single-Call 1:4 Material Generation API

**Files:**
- Create: `src/server/mome/materialSheet.ts`
- Create: `src/server/mome/materialSheet.test.ts`
- Modify: `server.ts`
- Modify: `src/services/materialGeneration/materialSheetClient.ts`

**Interfaces:**
- Consumes: 1–5 subjects, 1–5 matching reference images, `MaterialStyleId`, and `creationSessionId + subjectVersion + styleId`.
- Produces: validated `POST /api/gemini/generate-material-sheet` response containing one sheet and an idempotency key.

- [ ] **Step 1: Write validation and prompt tests**

Assert 0/6 subjects fail before model invocation; 0/6 references fail; subject/reference IDs must match; style IDs outside the four-value whitelist fail; generated prompt requires pure white, independent vertical elements, no text, no collage; response format is exactly image, `1:4`, `2K`.

- [ ] **Step 2: Write idempotency tests**

Assert two simultaneous calls with the same identity share one model promise; a completed identity returns the cached process-lifetime result; a different subject version or style creates a new call; failures are not automatically retried.

- [ ] **Step 3: Extract pure helpers from `server.ts`**

Move validation, preset prompt composition, response parsing, and bounded in-process idempotency storage to `src/server/mome/materialSheet.ts`. Keep the existing route path and fixed `gemini-nano-banana-2.1` model. Do not change analysis/chat route behavior.

- [ ] **Step 4: Set the official image response format**

Make the single `ai.interactions.create` call request `{ type: 'image', mime_type: 'image/png', aspect_ratio: '1:4', image_size: '2K' }`. There must be no model loop, retry loop, fallback model, `LocalMaterialProvider`, or mock result.

- [ ] **Step 5: Update client identity fields and verify**

Extend `GenerateMaterialSheetRequest` with `subjectVersion`, `styleId`, and `idempotencyKey`; preserve typed server errors.  
Run: `npm run test:run -- src/server/mome/materialSheet.test.ts && npm run lint && npm run build`  
Expected: single-call/idempotency tests pass and build succeeds.  
Commit: `feat: secure single material sheet generation`.

---

### Task 9: Generation, Result, Download, and Print Placeholder

**Files:**
- Create: `src/features/mome/pages/GenerationPage.tsx`
- Create: `src/features/mome/pages/GenerationPage.test.tsx`
- Create: `src/features/mome/pages/ResultPage.tsx`
- Create: `src/features/mome/pages/ResultPage.test.tsx`
- Create: `src/features/mome/components/PrintComingSoonDialog.tsx`
- Create: `src/features/mome/services/generationController.ts`
- Create: `src/features/mome/services/generationController.test.ts`
- Modify: `src/features/mome/MomeApp.tsx`

**Interfaces:**
- Consumes: confirmed subjects/style and the Task 8 client.
- Produces: screens 07/08, one persisted `PrintableMaterialSheet`, PNG/JPG download, and a non-networked print placeholder.

- [ ] **Step 1: Write controller duplicate-action tests**

Assert double confirm calls fetch once, rerender while pending calls fetch zero additional times, refresh with pending state does not resubmit, an identical completed job opens its saved result, and only explicit retry after failure calls fetch again.

- [ ] **Step 2: Implement generation controller**

Use an `AbortController` for UI waiting, persist status before calling, and persist successful image Blob/metadata. Keep selected subjects/style on every error. Do not claim that abort guarantees cost cancellation.

- [ ] **Step 3: Write page tests**

Assert generation screen displays the Figma waiting state and Cancel; result renders a scrollable 1:4 image; Download creates a file; `Print it` opens the placeholder; placeholder causes no fetch, WebSocket, or upload.

- [ ] **Step 4: Implement screens 07/08**

Use a readable long preview with logical `printWidthMm: 58`. Provide PNG and client-converted JPEG downloads without modifying the saved original Blob.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run -- src/features/mome/services/generationController.test.ts src/features/mome/pages/GenerationPage.test.tsx src/features/mome/pages/ResultPage.test.tsx && npm run lint && npm run build`  
Expected: duplicate protection, result, download, placeholder, and build checks pass.  
Commit: `feat: add generation and printable result flow`.

---

### Task 10: Single-Photo Inspiration and Local Media Library

**Files:**
- Create: `src/features/mome/pages/SinglePhotoPage.tsx`
- Create: `src/features/mome/pages/SuggestionsPage.tsx`
- Create: `src/features/mome/components/IdeasSheet.tsx`
- Create: `src/features/mome/pages/MediaLibraryPage.tsx`
- Create: `src/features/mome/pages/SecondaryFlows.test.tsx`
- Modify: `src/features/mome/MomeApp.tsx`

**Interfaces:**
- Consumes: one imported image, Memory Agent text service, and saved library sheets.
- Produces: screens 09–13 without invoking material generation unless the user explicitly enters that flow.

- [ ] **Step 1: Write secondary-flow tests**

Assert single-photo import accepts exactly one file; suggestions render Improve Layout/Add Stickers/Add a Story/Get Some Ideas; ideas sheet supports back/another/use; none of these actions call `/generate-material-sheet`; Media Library lists persisted completed sheets.

- [ ] **Step 2: Implement screens 09–13**

Match Figma bottom-sheet behavior and use the shared shell/Agent. “Another idea” may call only the text Agent. Do not restore collage, journal review, or print simulator routes.

- [ ] **Step 3: Verify and commit**

Run: `npm run test:run -- src/features/mome/pages/SecondaryFlows.test.tsx && npm run lint`  
Expected: secondary flow tests pass.  
Commit: `feat: add inspiration and media library flows`.

---

### Task 11: Accessibility, Responsive Visual QA, and End-to-End Acceptance

**Files:**
- Create: `src/features/mome/MomeApp.integration.test.tsx`
- Create: `docs/qa/mome-acceptance.md`
- Modify: `src/index.css`
- Modify: focused MOME files only when QA identifies defects.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified integrated app and a repeatable manual QA record.

- [ ] **Step 1: Write the integrated happy-path test**

Cover home → prompt → recommendation acknowledgement → choose photos → import → analysis/review → five subjects → style → one generation request → result → download → print placeholder.

- [ ] **Step 2: Add failure-path integration tests**

Cover picker cancellation, 201-file limit, one failed analysis batch, 429 generation error with preserved choices, refresh recovery, and reduced-motion mode.

- [ ] **Step 3: Run full automated verification**

Run: `npm run test:run && npm run lint && npm run build`  
Expected: all tests pass, TypeScript exit 0, Vite build exit 0.

- [ ] **Step 4: Perform visual QA against Figma**

Inspect 320×568, 375×812, 390×844, and 430×932 viewports plus centered desktop. Verify safe areas, two-column grid, fixed controls, Agent/bubble alignment, full 1:4 scrolling, and no fake phone frame. Compare each reachable screen to its Figma frame; screen 03 is intentionally absent.

- [ ] **Step 5: Perform real-service smoke tests without uncontrolled spend**

Verify `/api/health` reports a configured key. Test Memory Agent with 1 then 12 photos. Test generation once with one subject and one reference image only after confirming paid-project access. Record actual request count and result/error; never run a 200-photo paid smoke test.

- [ ] **Step 6: Record acceptance and commit**

Complete `docs/qa/mome-acceptance.md` with commands, viewport results, API request counts, known platform limitations, and deferred printer work.  
Commit: `test: verify mome dual agent application`.

---

## Final Delivery Gate

Before packaging or syncing to GitHub:

1. Run `git status --short` and confirm only intended files are changed.
2. Run `npm run test:run`, `npm run lint`, and `npm run build` from a clean checkout.
3. Inspect the production build through the Express server, not only Vite HMR preview.
4. Confirm no `.env`, API key, Base64 photo payload, or generated user photo is tracked by Git.
5. Create a ZIP from the clean project excluding `.git`, `node_modules`, `dist`, secrets, and user-imported data.
6. Provide the user with the ZIP, GitHub import steps, and the exact AI Studio Secret name `GEMINI_API_KEY` without exposing its value.

