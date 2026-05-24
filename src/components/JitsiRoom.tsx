import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users } from "lucide-react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => {
      dispose: () => void;
      addListener: (event: string, handler: (data: unknown) => void) => void;
      executeCommand: (cmd: string, ...args: unknown[]) => void;
    };
  }
}

export type ParticipantStatus = "connecting" | "joined";
export type Participant = { id: string; displayName?: string; status: ParticipantStatus };

interface Props {
  roomId: string;
  displayName?: string;
  email?: string;
  /** When true, mic stays live but video tile is hidden (used by FloatingVideo minimize). */
  audioOnly?: boolean;
  showParticipants?: boolean;
  onParticipantsChange?: (participants: Participant[]) => void;
}

type JitsiApi = {
  dispose: () => void;
  addListener: (event: string, handler: (data: unknown) => void) => void;
  executeCommand: (cmd: string, ...args: unknown[]) => void;
};

const isInPreviewIframe = () => {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
};

export function JitsiRoom({
  roomId,
  displayName,
  email,
  audioOnly = false,
  showParticipants = true,
  onParticipantsChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const [started, setStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const nested = isInPreviewIframe();
  const externalUrl = `https://meet.jit.si/AskATutor-${roomId}`;

  useEffect(() => {
    onParticipantsChange?.(participants);
  }, [participants, onParticipantsChange]);

  const requestMediaAndStart = async () => {
    setPermissionError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser cannot access the camera or microphone.");
      return;
    }
    try {
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

  useEffect(() => {
    if (!apiRef.current) return;
    try {
      apiRef.current.executeCommand(audioOnly ? "muteVideo" : "unmuteVideo");
    } catch {
      /* ignore */
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

      const api: JitsiApi = new window.JitsiMeetExternalAPI("meet.jit.si", {
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

      api.addListener("videoConferenceJoined", (d: unknown) => {
        const data = d as { id: string; displayName?: string };
        setParticipants((p) => {
          const next = p.filter((x) => x.id !== data.id);
          return [
            ...next,
            { id: data.id, displayName: data.displayName ?? displayName ?? "You", status: "joined" },
          ];
        });
      });
      api.addListener("participantJoined", (d: unknown) => {
        const data = d as { id: string; displayName?: string };
        setParticipants((p) => {
          const next = p.filter((x) => x.id !== data.id);
          return [...next, { id: data.id, displayName: data.displayName ?? "Guest", status: "connecting" }];
        });
        // Promote to joined shortly after — Jitsi has no per-peer "connected" event over the API
        window.setTimeout(() => {
          setParticipants((p) =>
            p.map((x) => (x.id === data.id ? { ...x, status: "joined" as ParticipantStatus } : x)),
          );
        }, 1500);
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
      api.addListener("videoConferenceLeft", () => {
        setParticipants([]);
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
      setParticipants([]);
    };
  }, [started, roomId, displayName, email]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="flex h-full w-full items-center justify-center bg-background">
        {!started && (
          <div className="flex max-w-xs flex-col items-center gap-3 p-4 text-center">
            {nested && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
                <p className="font-semibold">Audio &amp; video may not work in the preview frame.</p>
                <p className="mt-1 opacity-90">
                  Browsers block camera and microphone inside nested previews. Open the live class in a new tab for full
                  audio/video.
                </p>
                <Button asChild size="sm" className="mt-2 w-full">
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" /> Open class in new tab
                  </a>
                </Button>
              </div>
            )}
            <Button onClick={requestMediaAndStart}>Start camera and mic</Button>
            {permissionError && <p className="text-xs text-destructive">{permissionError}</p>}
          </div>
        )}
      </div>
      {started && showParticipants && participants.length > 0 && (
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
          <Users className="h-3 w-3" />
          <span>{participants.length}</span>
        </div>
      )}
    </div>
  );
}
