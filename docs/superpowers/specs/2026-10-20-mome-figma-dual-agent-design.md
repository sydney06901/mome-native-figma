# MOME Figma UI and Dual-Agent Application Design

**Date:** 2026-10-20  
**Status:** User-approved design, pending implementation plan  
**Primary design source:** Figma file `hicodexcomehere`  
**Reference implementation:** Imported `mome-recovered` prototype

## 1. Product goal

MOME is a mobile-first web application that helps a user turn personal photographs into printable physical-journal materials. It is not an electronic journal editor. The first release must provide a coherent path from real photo import, through AI-assisted photo exploration, to one downloadable color material sheet.

The application contains two separate AI responsibilities:

1. **Memory Explorer Agent**: talks to the user, understands the search intention, analyzes imported photographs in batches, and visibly explores the photo grid while revealing candidates.
2. **Material Generation Agent**: receives no more than five confirmed subjects and one style preset, then performs exactly one paid image-generation request to create one long printable material sheet.

The `Print it` action is a first-release placeholder. Raspberry Pi and Wi-Fi printer communication are explicitly deferred. The architecture must leave a clean future integration point without implementing a print queue now.

## 2. Delivery strategy

Use a **clean Figma-driven UI shell with selective migration of proven services**.

Do not restyle the existing large page tree in place. The imported prototype contains valuable working services but also carries old routes, duplicated UI states, mock-generation remnants, electronic-journal features, and an oversized `AlbumWorkspace` component. Reusing it wholesale would preserve accidental complexity and make visual work fragile.

Migrate only the verified capabilities:

- Gemini server-side authentication through `GEMINI_API_KEY`;
- photo batch analysis;
- Gemini chat-agent communication;
- single material-sheet generation;
- IndexedDB repositories and useful photo-compression utilities;
- the proven visual review queue concepts.

Rebuild page composition, routing, workflow state, and visual components around the approved Figma flow. Existing APIs may be adapted behind stable service interfaces, but API keys must remain server-only.

## 3. Application layers

### 3.1 UI layer

Recreate the Figma screens as real React components. Page PNG files are visual references, not page backgrounds. Page SVG files are measurement/vector references, not interactive DOM replacements. Buttons, forms, photo grids, progress indicators, bottom sheets, and navigation remain semantic HTML.

The supplied animated Agent SVG files are runtime assets. The supplied bubble SVG is a visual shell with live HTML text layered over it.

### 3.2 Workflow layer

The application has three explicit flows:

- **Photo exploration:** 01 → 02 → system photo picker → 04 → 05.
- **Material generation:** 05 → 06 → 07 → 08.
- **Single-photo inspiration:** 09 → 10 → 11/12.

Screen 03 is removed. A web app cannot reliably control the appearance or timing of the mobile operating system keyboard, so a dedicated fake-keyboard screen would be misleading and brittle.

### 3.3 AI service layer

Memory exploration and material generation are independent services with independent state, validation, cancellation, and errors. Failure in one must not corrupt the other.

### 3.4 Data layer

Use IndexedDB for session metadata, processed photo blobs, thumbnails, analysis results, candidate selections, generation state, and generated material-sheet blobs. Avoid persisting large Base64 strings.

## 4. Page flow and behavior

### 4.1 Screen 01 — Main View

The user may begin with a thought or choose the photo entry. Starting a new exploration always creates a new `explorationSessionId`; it must not silently reopen the previous photo set. Navigating backward within an active flow preserves the active session.

### 4.2 Screen 02 — Agent prompt and photo entry

On first entry for a new session, call the existing Gemini chat-agent service once. The response contains:

- a short English greeting for the Agent bubble;
- two or three recommended search intentions;
- a short acknowledgement paired with each recommendation.

The response is cached in the active session. Component rerenders and navigation back to screen 02 do not repeat the request.

Selecting a recommendation changes the Agent bubble immediately to its acknowledgement, for example, “Sure! Let me explore with you ✦”. The `Explore` control becomes a highlighted `Choose photos` action. This second direct user action opens the operating-system file picker. A separate click is required because mobile browsers may block a file picker opened after an asynchronous delay.

A custom query receives a stable short acknowledgement and uses the same `Choose photos` action. Cancelling the picker leaves the user on screen 02 and does not call photo analysis.

If the greeting request fails, keep the product’s neutral built-in welcome copy and allow import. This copy is interface text, not a fabricated AI analysis result.

### 4.3 Screen 04 — AI photo exploration

Accept 1–200 real photos per new exploration. If more than 200 are selected, accept the first 200 and show a clear limit message. Import work is incremental and bounded: create processed analysis images and thumbnails without converting the entire selection to Base64 in memory.

Analyze in batches of 10–12 photos with at most two batches in flight. Results enter a data queue independently from the visual review queue.

The visual queue shows full Agent movement and state transitions for the first 12 photos (or all photos when fewer than 12 were imported):

- travel to the target;
- observe;
- think;
- reveal match or skip.

Each full review lasts approximately 2.5–4 seconds. From photo 13 onward, switch automatically to a faster 0.8–1.4 second review. Users may pause, resume, or skip animation. Skipping affects presentation only and must never discard real analysis results.

The floating Agent follows photo element bounds, scrolls the target into view, and never replaces or hides the system pointer. Candidate badges appear only when that photo reaches the reveal phase, even if its data result arrived earlier.

Animation durations must live in one typed configuration object rather than scattered timers. The configuration includes travel, observe, think, reveal, full-review count, fast-mode timings, and easing. All durations can therefore be tuned later without changing analysis code.

### 4.4 Screen 05 — Confirmed photo subjects

Gemini may identify many candidates, but the generation plan contains no more than five enabled subjects. The user may remove, replace, or reorder these subjects. Continue only with at least one and at most five.

### 4.5 Screen 06 — Style selection

Style buttons save a whitelisted `styleId`; clicking a style never calls the paid image model. Initial presets are:

- `printmaking`: carved print texture, handmade line variation, limited palette, subtle registration offset, paper character;
- `pixel-art`: crisp pixel edges, retro game palette, no soft antialiasing, recognizable subjects;
- `retro-manga-ink`: vintage ink linework, screentone shading, strong contrast, restrained accent color;
- `dreamy-anime`: soft animation illustration, dreamy light, gentle color, clear printable silhouettes.

The server combines the selected preset with common constraints: use only confirmed subjects, preserve recognizability, produce five or fewer complete independent elements, arrange vertically with white separation, use a pure-white background and printable sticker borders, add no labels/watermarks/gibberish, and do not make a photo collage.

Only the final `Make my stickers!!` confirmation proceeds to generation.

### 4.6 Screen 07 — Generation

Submit exactly one generation request for one material sheet. Request a 1:4 portrait aspect ratio at 2K with the five or fewer subjects arranged vertically. Display the approved Figma generation visual and a cancellable waiting state.

Cancelling the client wait cannot guarantee that an already-submitted model request incurs no cost. If the server later receives a successful result, preserve it for the session.

### 4.7 Screen 08 — Result

Show the complete long sheet in a vertically scrollable preview. Allow high-quality color PNG/JPG download. Record a logical paper width of 58 mm for future print processing; final pixel resizing must wait for the real printer’s printable-dot width.

`Print it` opens a lightweight “printing connection coming soon” dialog only. It creates no job, calls no printer endpoint, and uploads no print file.

### 4.8 Screens 09–12 — Single-photo inspiration

Import one real image, show analysis/suggestion actions, and present ideas in the approved bottom sheet. These screens do not call material generation unless the user explicitly enters that flow. “Another idea” may request another text suggestion but never silently triggers paid image generation.

### 4.9 Screen 13 — Media Library

Display locally saved generated sheets and supported material categories. The first release reads IndexedDB. Do not restore the old electronic collage/editor experience.

## 5. Agent visuals and responsive behavior

Map SVGs to product states:

- main view: unimpressed;
- conversation/waiting: scared;
- analyzing: purple thinking;
- describing: black;
- mismatch: red;
- match: green.

Preload assets to prevent flashing. Cross-fade and subtly scale between states. Dynamic bubble text is HTML over the supplied bubble SVG. Respect `prefers-reduced-motion`: replace long travel and bounce with fades and state colors.

Use the 430×932 Figma frame as the visual baseline, with fluid support from approximately 320–430 CSS pixels and safe-area insets. On desktop, render one centered mobile-width application surface on a quiet neutral background, without a fake phone frame. The photo grid remains two columns where viable. The 1:4 generated sheet scrolls at readable size rather than being reduced to a thumbnail.

## 6. Data model and persistence

An exploration session stores:

- session ID and timestamps;
- user query;
- cached greeting, suggestions, and acknowledgements;
- processed photos and thumbnails;
- per-photo analysis status and result;
- visual-review position and speed mode;
- candidate IDs;
- subject plan (maximum five);
- selected style ID;
- generation job status and error;
- final generated sheet blob and metadata.

Starting from screen 01 creates a fresh temporary session. Back navigation inside a flow retains it. Refresh restores the active session. Completed material sheets may be promoted to the library. Beginning another exploration does not display the previous session’s photos.

## 7. Cost and duplicate-request protection

Generation identity is derived from `creationSessionId + subjectVersion + styleId`.

- Disable confirmation while a request is active.
- Treat an identical active request as the same job.
- Return a saved successful result for an identical completed job.
- Changing a subject or style creates a new version.
- Refresh restores status and never automatically submits again.
- Do not automatically retry, change models, or fall back to local/mock generation.
- A user-initiated retry after a visible failure is a new paid request.

Photo analysis retains successful batches and retries only failed batches when the user explicitly chooses to retry.

## 8. Error and privacy behavior

Distinguish missing API key, rate limit, unavailable model, invalid photo, network failure, missing image output, and local-storage failure. Preserve selected subjects and style on generation errors.

Send photos to Gemini only after explicit import. Never log full image Base64 or API keys. Keep `GEMINI_API_KEY` in server secrets. The first release uses no separate third-party photo storage.

## 9. Acceptance criteria

- Figma layout and interactions are recreated as functioning UI, not flattened screenshots.
- Screen 03 is removed and screen 02 provides the two-step recommendation/acknowledgement/photo-picker interaction.
- A new session imports 1–200 photos; photo 201+ is safely rejected.
- Imports of 1, 5, 12, 50, and 200 photos remain responsive.
- Analysis uses 10–12-photo batches and no more than two concurrent batches.
- The first 12 photos show full review animation; later photos use configurable fast review.
- Pause, resume, and skip do not lose data.
- No more than five subjects reach generation.
- Style selection alone incurs no image-generation request.
- One final confirmation produces one 1:4 2K color sheet using one generation call.
- Duplicate clicks and refresh do not duplicate generation.
- Failures remain truthful and retain user choices.
- Download works; `Print it` is placeholder-only.
- API keys and image Base64 are absent from client code and logs.
- TypeScript checking and production build succeed.
- Mobile safe areas, reduced motion, and desktop centered preview work.

## 10. Deferred work

- Raspberry Pi authentication and cloud print queue;
- printer task claim/status APIs;
- conversion to the printer’s actual monochrome dot width;
- remote user accounts and cross-device cloud library;
- native mobile packaging.

