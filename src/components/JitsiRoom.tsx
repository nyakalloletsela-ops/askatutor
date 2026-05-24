import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => {
      dispose: () => void;
      addListener: (event: string, handler: (data: unknown) => void) => void;
      executeCommand: (cmd: string, ...args: unknown[]) => void;
    };
  }
}

interface Props {
  roomId: string;
  displayName?: string;
  email?: string;
  /** When true, mic stays live but video tile is hidden (used by FloatingVideo minimize). */
  audioOnly?: boolean;
  showParticipants?: boolean;
}

type Participant = { id: string; displayName?: string };

type JitsiApi = {
  dispose: () => void;
  addListener: (event: string, handler: (data: unknown) => void) => void;
  executeCommand: (cmd: string, ...args: unknown[]) => void;
};

export function JitsiRoom({ roomId, displayName, email, audioOnly = false, showParticipants = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const [started, setStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const requestMediaAndStart = async () => {
    setPermissionError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser cannot access the camera or microphone.");
      return;
    }
    try {
      // Pre-flight permission check inside the user gesture
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setStarted(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setPermissionError("Camera or microphone is blocked. Allow access in your browser settings, then try again.");
      } else if (name === "NotFoundError") {
        setPermissionError("No camera or microphone was found on this device.");
      } else if (name === "NotReadableError") {
        setPermissionError("Camera or microphone is already in use by another app.");
      } else {
        setPermissionError("Camera and microphone could not start. Check browser permissions and try again.");
      }
    }
  };

  // Toggle video only — keeps audio track alive when minimized
  useEffect(() => {
    if (!apiRef.current) return;
    try {
      apiRef.current.executeCommand("setVideoQuality", audioOnly ? 180 : 720);
      // Mute / unmute video. We do not touch audio so mic stays as user set it.
      apiRef.current.executeCommand(audioOnly ? "muteVideo" : "unmuteVideo");
    } catch {
      // Older Jitsi may not support these commands; ignore.
    }
  }, [audioOnly]);

  useEffect(() => {
    if (!started) return;
    let observer: MutationObserver | null = null;

    const start = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

      observer = new MutationObserver(() => {
        const iframe = containerRef.current?.querySelector("iframe");
        if (iframe) {
          iframe.setAttribute(
            "allow",
            "camera *; microphone *; display-capture *; autoplay; clipboard-write; fullscreen; speaker-selection",
          );
          iframe.setAttribute("allowfullscreen", "true");
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(containerRef.current, { childList: true, subtree: true });

      const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: `AskATutor-${roomId}`,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName: displayName ?? "Guest", email: email ?? "" },
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "desktop",
            "fullscreen",
            "hangup",
            "chat",
            "raisehand",
            "tileview",
            "settings",
          ],
        },
      });
      apiRef.current = api;

      const refresh = () => {
        // Jitsi exposes getParticipantsInfo via async — use listener-tracked state instead.
      };

      api.addListener("videoConferenceJoined", (d: unknown) => {
        const data = d as { id: string; displayName?: string };
        setParticipants((p) => {
          if (p.some((x) => x.id === data.id)) return p;
          return [...p, { id: data.id, displayName: data.displayName ?? displayName ?? "You" }];
        });
        refresh();
      });
      api.addListener("participantJoined", (d: unknown) => {
        const data = d as { id: string; displayName?: string };
        setParticipants((p) => {
          if (p.some((x) => x.id === data.id)) return p;
          return [...p, { id: data.id, displayName: data.displayName ?? "Guest" }];
        });
      });
      api.addListener("participantLeft", (d: unknown) => {
        const data = d as { id: string };
        setParticipants((p) => p.filter((x) => x.id !== data.id));
      });
      api.addListener("displayNameChange", (d: unknown) => {
        const data = d as { id: string; displayname?: string };
        setParticipants((p) =>
          p.map((x) => (x.id === data.id ? { ...x, displayName: data.displayname ?? x.displayName } : x)),
        );
      });
    };

    if (!window.JitsiMeetExternalAPI) {
      const s = document.createElement("script");
      s.src = "https://meet.jit.si/external_api.js";
      s.async = true;
      s.onload = start;
      document.body.appendChild(s);
    } else {
      start();
    }

    return () => {
      observer?.disconnect();
      observer = null;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [started, roomId, displayName, email]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="flex h-full w-full items-center justify-center bg-background">
        {!started && (
          <div className="flex max-w-64 flex-col items-center gap-3 p-4 text-center">
            <Button onClick={requestMediaAndStart}>Start camera and mic</Button>
            {permissionError && <p className="text-xs text-destructive">{permissionError}</p>}
          </div>
        )}
      </div>
      {started && showParticipants && participants.length > 0 && (
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
          <Users className="h-3 w-3" />
          <span>{participants.length}</span>
          <span className="ml-1 max-w-[160px] truncate opacity-80">
            {participants.map((p) => p.displayName ?? "Guest").join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}
