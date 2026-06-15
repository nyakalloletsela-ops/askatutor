# Custom Whiteboard — Replace tldraw

This is a large rewrite. I'll do it in one pass but want to confirm scope before deleting the existing tldraw integration, because some current features (Yjs binding, AI handwriting → LaTeX conversion, playback timeline, snapshot review pages) are tightly coupled to tldraw's shape model and will need to be re-implemented or re-wired against the new model.

## What gets built

### 1. Custom canvas engine (`src/components/whiteboard/engine/`)
- `Scene.ts` — document model: ordered array of `Shape` objects (id, type, props, z, page).
- `Camera.ts` — pan/zoom with wheel + pinch + space-drag.
- `Renderer.ts` — HiDPI HTML5 Canvas renderer with dirty-rect redraw.
- `History.ts` — undo/redo stack of patches.
- `Pointer.ts` — unified mouse/touch/pen input.
- Shape types: `pencil`, `highlighter`, `line`, `arrow`, `rect`, `ellipse`, `triangle`, `text`, `sticky`, `image`.

### 2. Tools
Pencil, highlighter (alpha + screen blend), eraser (object + pixel), line, arrow, rect, ellipse, triangle, text (inline contenteditable overlay), sticky note, image upload, select (single + marquee multi-select with transform handles).

### 3. UI (`src/components/whiteboard/ui/`)
- `Whiteboard.tsx` — top-level component, replaces `TldrawCanvas`.
- `Toolbar.tsx` — floating bottom-center toolbar, dark theme.
- `ColorPicker.tsx`, `SizeSlider.tsx`, `PropertiesPanel.tsx`.
- `PageBar.tsx` (numeric page indicator only — per earlier preference).
- Keyboard shortcuts: V/P/H/E/L/A/R/O/T/S, Ctrl+Z/Y, Ctrl+C/V/D, Del, Ctrl+], Ctrl+[, Space+drag, +/-.
- Export menu: PNG, JPG, PDF (via `jspdf`), JSON import/export.

### 4. Realtime collaboration
- Drop `Yjs` + tldraw binding. Use Supabase Realtime broadcast channel `whiteboard:{roomId}` for:
  - `op` events (shape add/update/delete patches) — last-writer-wins per shape id, monotonic lamport clock to resolve conflicts.
  - `cursor` events (throttled 30 Hz) for presence + name labels.
- Periodic snapshot (every ~3s of idle) persisted to `whiteboard_snapshots` (existing table) as JSON document.
- On join: load latest snapshot, then replay ops since snapshot timestamp from `whiteboard_mutations` (existing table, repurposed: `{ kind: 'op', data: patch }`).

### 5. Classroom integration
- Teacher controls (visible when `userId === session.tutor_id` or admin):
  - Lock board (broadcasts lock state; students get read-only renderer).
  - Clear board (with confirm).
  - Save to lesson history (writes snapshot + marks `whiteboard_snapshots.is_milestone`).
- Student view: tools hidden when locked; cursor presence still shown.

### 6. AI handwriting conversion
- Keep `ConvertButton` + `insertConversion.ts`, but rewrite the bridge:
  - Rasterize selected pencil strokes from the new canvas to a data URL.
  - Send to existing `whiteboard-ai.functions.ts` (no change).
  - Insert returned text/LaTeX as a `text` shape (LaTeX rendered via existing KaTeX path → SVG image shape).

### 7. Cleanup
- Delete: `src/components/whiteboard/canvas/TldrawCanvas.tsx`, `collaboration/useTldrawYjsBinding.ts`, `collaboration/supabase-yjs-provider.ts`, `collaboration/useYjsRoom.ts`, `src/components/Whiteboard.tsx` (legacy).
- Remove from `package.json`: `tldraw`, `yjs`, `y-protocols` (if present).
- Update imports in `classroom.$roomId.tsx`, `admin.whiteboard.tsx`, `whiteboard-review.$sessionId.tsx`, `PlaybackPlayer.tsx`.
- Keep `whiteboards`, `whiteboard_snapshots`, `whiteboard_mutations`, `whiteboard_strokes`, `canvas_timeline_deltas` tables. No migration needed — snapshots become opaque JSON for the new format.

## Things I'm intentionally NOT doing unless you say so
- **Playback / timeline scrubber** (`PlaybackPlayer.tsx`, `RecordingBar.tsx`, `useRecorder.ts`): the existing recorder records tldraw deltas. I'll stub these to no-op so the build passes, and we can rebuild recording in a follow-up. Replaying the new op stream is straightforward but adds another ~day of work.
- **`whiteboard-review.$sessionId.tsx`** snapshot viewer: I'll make it render the new JSON snapshot read-only. Old tldraw snapshots in the DB will show an "archived format" notice — they won't be migrated.
- **Admin whiteboard test page** (`admin.whiteboard.tsx`): updated to use new component, no extra admin tooling added.

## Risks
- Old saved tldraw snapshots become unreadable in the new viewer (notice shown instead).
- Recording/playback temporarily unavailable.
- First version of multi-select transform handles will be functional but less polished than tldraw's.

## Confirm before I start
1. OK to stub playback/recording and lose old snapshot rendering? (Yes = proceed as planned. No = I'll keep tldraw installed only for the review/playback routes and replace it everywhere else.)
2. Realtime via Supabase broadcast (simpler, no Yjs) is fine? (Alternative: keep Yjs as the CRDT but with a custom renderer — more robust for offline edits, more code.)
