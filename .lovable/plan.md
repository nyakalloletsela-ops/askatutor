
# Premium Virtual Classroom — Full Replacement

Replace Jitsi with a native 1:1 WebRTC stack, redesign the classroom shell around the whiteboard, and ship behind a swappable `ClassroomRTCService` abstraction so a media server (LiveKit / mediasoup) can be dropped in later without touching the UI.

## Scope

In scope this pass:
- Rip out Jitsi (`JitsiMeetExternalAPI`, embed component, env/keys, related helpers).
- New `ClassroomRTCService` interface + `PeerToPeerRTCService` implementation (mic, camera, screenshare, device picker, fullscreen, connection-quality stats).
- Supabase Realtime signaling channel per `room_id` (offer / answer / ICE / leave) — no Socket.IO.
- New classroom layout: header, whiteboard as primary surface, two video cards, bottom action bar, right-side collapsible panel with tabs (Chat / Files / Notes / AI Tutor).
- Mobile layout: full-bleed whiteboard with floating draggable video PiPs and bottom toolbar.
- Wire existing whiteboard, chat, files, notes, and AI tutor features into the new shell (no whiteboard rewrite — controls fit-to-screen work from prior turn stays).
- Connection quality + network status indicators driven by `RTCPeerConnection.getStats()`.

Out of scope (explicit):
- Session recording (status UI only, no MediaRecorder).
- Group calls / >2 participants.
- Media server (LiveKit/mediasoup) — abstraction only, P2P implementation ships.
- Lesson replay capture (replay viewer keeps reading existing canvas deltas).
- PDF annotation rewrite, sticky notes, laser pointer if not already present (kept as follow-ups; whiteboard stays as-is).

## Architecture

```text
src/lib/classroom-rtc/
  types.ts                 # ClassroomRTCService interface, events, stats shape
  PeerToPeerRTCService.ts  # WebRTC impl using Supabase Realtime signaling
  signaling.ts             # Realtime channel helpers (offer/answer/ice/leave)
  index.ts                 # createClassroomRTC(roomId, userId) factory

src/hooks/
  useClassroomRTC.ts       # React binding: state, remote stream, controls, stats

src/components/classroom/
  ClassroomShell.tsx       # Layout orchestration (desktop + mobile)
  ClassroomHeader.tsx      # Title, timer, quality, settings, leave
  VideoCard.tsx            # HD tile: name, speaking, quality, share badge, fullscreen, PiP
  VideoStage.tsx           # Two-up video region (desktop) / floating PiPs (mobile)
  ActionBar.tsx            # Mic, camera, share, chat, files, AI, leave
  SidePanel.tsx            # Collapsible right panel host
  panels/ChatPanel.tsx     # wraps existing classroom chat
  panels/FilesPanel.tsx    # wraps existing files UI
  panels/NotesPanel.tsx    # wraps existing notes UI
  panels/AIPanel.tsx       # wraps existing AI tutor
  DeviceSettingsDialog.tsx # camera / mic / speaker picker
```

Route `src/routes/_authenticated/classroom/$roomId.tsx` swaps the Jitsi embed for `<ClassroomShell />`. The whiteboard component is mounted by the shell, unchanged.

### Service interface (sketch)

```ts
interface ClassroomRTCService {
  join(): Promise<void>;
  leave(): Promise<void>;
  toggleMic(on?: boolean): Promise<boolean>;
  toggleCamera(on?: boolean): Promise<boolean>;
  startScreenShare(): Promise<void>;
  stopScreenShare(): Promise<void>;
  setDevices(d: { camId?: string; micId?: string; spkId?: string }): Promise<void>;
  on(event: RTCEvent, cb: (p: unknown) => void): () => void;
  getLocalStream(): MediaStream | null;
  getRemoteStream(): MediaStream | null;
  getStats(): Promise<ConnectionStats>; // { rttMs, jitterMs, packetLoss, quality: 'good'|'fair'|'poor' }
}
```

UI talks only to this interface (+ React hook). Swapping to LiveKit later = new implementation, no UI changes.

### Signaling

Single Supabase Realtime channel `classroom:{roomId}` using broadcast events:
- `presence` — who's in the room
- `sdp-offer` / `sdp-answer` — targeted by user id
- `ice` — trickle candidates
- `leave` — graceful teardown

Authorization piggybacks on the existing `can_access_classroom_room` rule via a server function that returns short-lived presence info; non-members get a Realtime 403 because of RLS on `whiteboard_sessions`/`sessions`.

## Removal list

- `src/components/classroom/JitsiRoom*.tsx` (or wherever the embed lives)
- `JitsiMeetExternalAPI` script loader / `<script>` tag
- Jitsi env vars, room-name helpers, JWT helpers (if any)
- Any `lib-jitsi-meet` package + leftover types

I will grep the repo first to enumerate exactly what's there and delete in one pass.

## Mobile / desktop behavior

- `< md`: whiteboard full-bleed; two video tiles render as draggable 96×128 PiPs (snap to corners); action bar pinned bottom; side panel becomes a bottom sheet.
- `≥ md`: whiteboard fills the main column; two video tiles in a strip under the whiteboard (or floating top-right when whiteboard maximized); side panel slides in from the right; toolbar stays at top per the previously-shipped preference.

## Verification before finishing

- Build passes.
- Two browser tabs (tutor + student demo accounts) connect over WebRTC: local + remote tracks render, mic/camera toggles propagate, screen share works one-way, quality indicator updates.
- Whiteboard lock + collab still work (no regression).
- No remaining references to `JitsiMeetExternalAPI` or `jitsi` in `src/`.

## Risks / notes

- TURN servers: P2P over public STUN works for most home networks but fails behind symmetric NAT. Decision: ship with Google STUN only; surface a clear "connection failed — try a different network" toast. Add TURN later if it becomes a real-world problem.
- No recording this pass; the header shows a static "Not recording" pill rather than a misleading red dot.
- Realtime quota: one channel per active classroom, lightweight broadcast — within Lovable Cloud free tier for expected load.
