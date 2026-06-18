# Whiteboard Engine Replacement — tldraw + Yjs

Replacing the current custom `Whiteboard.tsx` canvas with tldraw as the rendering engine and Yjs (over Supabase Realtime) for multi-user collaboration. Auth, routes, classroom shell, Jitsi video, files, notes, labs all stay untouched.

## Step 1 — Dependencies

Install:
- `tldraw` (the package is published as `tldraw`, not `@tldraw/tldraw` — `@tldraw/tldraw` is a deprecated alias and will fail or pull an old version)
- `yjs`
- `y-protocols` (needed for awareness/cursors)
- `@tldraw/sync` is NOT used — we use tldraw's `store.listen` + Yjs sync helper manually so we can sit on Supabase Realtime instead of a websocket server

Note: `y-supabase` exists but is unmaintained and ships its own channel format; rolling a thin adapter against `supabase.channel(...).on('broadcast')` is more reliable and ~60 lines. I'll do that instead unless you insist on `y-supabase`.

`lucide-react` is already installed.

## Step 2 — Directory layout

```text
src/components/whiteboard/
  canvas/
    TldrawCanvas.tsx          // mounts <Tldraw />, wires persistence + sync
    persistence.ts            // localStorage snapshot per room (viewport + doc)
  collaboration/
    useYjsRoom.ts             // creates Y.Doc + awareness, connects to Supabase
    supabase-yjs-provider.ts  // Yjs <-> Supabase broadcast adapter (update + awareness)
    useTldrawYjsBinding.ts    // two-way bind tldraw store <-> Y.Map of records
    cursors.tsx               // <LiveCursors /> overlay using awareness states
  index.ts
```

Each file kept under 300 lines; logic-heavy parts live in hooks.

## Step 3 — Phase 1: Core canvas

- `TldrawCanvas.tsx` renders `<Tldraw persistenceKey={`atl-${roomId}`} />`. tldraw's built-in persistence handles local snapshot + viewport restore on refresh, plus full default toolbar (select, draw, eraser, highlight, rect, ellipse, arrow, note, text), pan/zoom (wheel + pinch), undo/redo.
- Mount it in `classroom.$roomId.tsx` Whiteboard tab in place of the old `<Whiteboard />`.
- The old `src/components/Whiteboard.tsx` stays on disk for now (not imported) so other references don't break; I'll remove it after verifying nothing else imports it.

## Step 4 — Phase 2: Realtime collaboration

- `useYjsRoom(roomId, user)` returns `{ doc, awareness }`.
- `supabase-yjs-provider.ts` opens `supabase.channel(`yjs:${roomId}`, { config: { broadcast: { self: false } } })`:
  - On local `doc.on('update', u)` → `channel.send({ type:'broadcast', event:'y-update', payload:{ u: base64(u) } })`
  - On remote `y-update` → `Y.applyUpdate(doc, fromBase64(u))`
  - Awareness: same pattern with `awarenessProtocol.encodeAwarenessUpdate` on event `y-awareness`
  - On `SUBSCRIBED` → broadcast a `y-sync-request`; peers reply with full `Y.encodeStateAsUpdate(doc)`. Handles refresh / late join / reconnect (Supabase channel auto-reconnects; we re-send sync-request in the resubscribe handler so missed deltas catch up).
- `useTldrawYjsBinding(editor, doc)`:
  - Y.Map `records` keyed by tldraw record id.
  - On editor `store.listen({ source:'user', scope:'document' })` → write added/updated/removed records into the Y.Map inside `doc.transact`.
  - On Y.Map observe → `editor.store.mergeRemoteChanges(() => store.put/remove)` to avoid echo loops.
- `cursors.tsx`: subscribe to `awareness` states, project each peer's page-space cursor through `editor.pageToScreen`, render a colored SVG arrow + name tag overlay positioned absolutely over the canvas. Local pointer position pushed via `editor.on('event', e => awareness.setLocalStateField('cursor', editor.inputs.currentPagePoint))` (throttled ~30ms).
- Color: deterministic hash of `user.id` → HSL.

## Step 5 — React error #300 on classroom open

#300 = "rendered fewer hooks than expected" — a conditional hook. After installing tldraw, the old `Whiteboard.tsx` is no longer rendered in the classroom tab so its OCR/overlay hook tree (which I suspect is the culprit, especially the `bumpText`/`mergeRefs` paths added recently) is out of the render path. I'll verify by loading `/classroom/demo-…` after the swap; if the crash persists it's in `classroom.$roomId.tsx` itself (likely the `videoRef`/`FloatingVideo` imperative handle) and I'll fix it there.

## Out of scope (will flag if needed)

- Server-side persistence of the tldraw doc in Postgres (Y.js updates can be appended to a `whiteboard_yjs_updates` table later for cold-start hydration beyond peer sync). For now: peer-sync + localStorage snapshot per client.
- Migrating existing `whiteboard_strokes` rows into tldraw shapes — the old format isn't compatible; old boards start empty under the new engine.
- AI "Convert all" button — current implementation is tied to the old canvas; can be reattached to tldraw in a follow-up by exporting the current page as PNG via `editor.toImage()` and feeding it to the existing `whiteboardConvert` server fn.

Approve to proceed.