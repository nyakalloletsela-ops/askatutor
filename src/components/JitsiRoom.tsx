import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, Video } from "lucide-react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>,
    ) => {
      dispose: () => void;
      addListener: (event: string, handler: (data: unknown) => void) => void;
      executeCommand: (cmd: string, ...args: unknown[]) => void;
      getIFrame?: () => HTMLIFrameElement;
    };
  }
}

export type ParticipantStatus = "connecting" | "joined";
export type Participant = { id: string; displayName?: string; status: ParticipantStatus };
export type MediaPermissionState =
  | "checking"
  | "granted"
  | "prompt"
  | "denied"
  | "unknown"
  | "unavailable";
export type MediaAvailabilityState =
  | "checking"
  | "available"
  | "missing"
  | "blocked"
  | "in-use"
  | "unknown"
  | "unavailable";
export type MediaDiagnostics = {
  cameraAvailable: MediaAvailabilityState;
  microphoneAvailable: MediaAvailabilityState;
  cameraPermission: MediaPermissionState;
  microphonePermission: MediaPermissionState;
  jitsiMessages: string[];
  lastCheckedAt?: number;
};

interface Props {
  roomId: string;
  displayName?: string;
  email?: string;
  /** When true, mic stays live but video tile is hidden (used by FloatingVideo minimize). */
  audioOnly?: boolean;
  showParticipants?: boolean;
  onParticipantsChange?: (participants: Participant[]) => void;
  onDiagnosticsChange?: (diagnostics: MediaDiagnostics) => void;
  onApiReady?: (api: { executeCommand: (cmd: string, ...args: unknown[]) => void } | null) => void;
}

type JitsiApi = {
  dispose: () => void;
  addListener: (event: string, handler: (data: unknown) => void) => void;
  executeCommand: (cmd: string, ...args: unknown[]) => void;
  getIFrame?: () => HTMLIFrameElement;
};

type ScriptStatus = "loading" | "ready" | "error";

const iframeAllow = "autoplay; camera; microphone; display-capture; clipboard-write; fullscreen; speaker-selection";

const loadJitsiScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Browser only"));
    if (window.JitsiMeetExternalAPI) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://meet.jit.si/external_api.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Video service failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Video service failed to load."));
    document.body.appendChild(script);
  });

const isInPreviewIframe = () => {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
};

const initialDiagnostics: MediaDiagnostics = {
  cameraAvailable: "checking",
  microphoneAvailable: "checking",
  cameraPermission: "checking",
  microphonePermission: "checking",
  jitsiMessages: [],
};

const readPermission = async (name: "camera" | "microphone"): Promise<MediaPermissionState> => {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";

  try {
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return status.state;
  } catch {
    return "unknown";
  }
};

const describeJitsiPayload = (prefix: string, data: unknown) => {
  if (!data || typeof data !== "object") return prefix;
  const payload = data as { message?: string; error?: string; type?: string; name?: string };
  const detail = payload.message ?? payload.error ?? payload.type ?? payload.name;
  return detail ? `${prefix}: ${detail}` : prefix;
};

export function JitsiRoom({
  roomId,
  displayName,
  email,
  audioOnly = false,
  showParticipants = true,
  onParticipantsChange,
  onDiagnosticsChange,
  onApiReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const audioOnlyRef = useRef(audioOnly);
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>(
    typeof window !== "undefined" && window.JitsiMeetExternalAPI ? "ready" : "loading",
  );
  const [started, setStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [diagnostics, setDiagnostics] = useState<MediaDiagnostics>(initialDiagnostics);
  const nested = isInPreviewIframe();
  const externalUrl = `https://meet.jit.si/AskATutor-${roomId}`;

  const patchDiagnostics = useCallback((patch: Partial<MediaDiagnostics>) => {
    setDiagnostics((current) => ({ ...current, ...patch, lastCheckedAt: Date.now() }));
  }, []);

  const addJitsiMessage = (message: string) => {
    setDiagnostics((current) => ({
      ...current,
      jitsiMessages: [message, ...current.jitsiMessages].slice(0, 5),
      lastCheckedAt: Date.now(),
    }));
  };

  const refreshDiagnostics = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      patchDiagnostics({
        cameraAvailable: "unavailable",
        microphoneAvailable: "unavailable",
        cameraPermission: "unavailable",
        microphonePermission: "unavailable",
      });
      return;
    }

    const [cameraPermission, microphonePermission] = await Promise.all([
      readPermission("camera"),
      readPermission("microphone"),
    ]);
    let cameraAvailable: MediaAvailabilityState = "unknown";
    let microphoneAvailable: MediaAvailabilityState = "unknown";

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      cameraAvailable = devices.some((device) => device.kind === "videoinput")
        ? "available"
        : "missing";
      microphoneAvailable = devices.some((device) => device.kind === "audioinput")
        ? "available"
        : "missing";
    } catch {
      cameraAvailable = cameraPermission === "denied" ? "blocked" : "unknown";
      microphoneAvailable = microphonePermission === "denied" ? "blocked" : "unknown";
    }

    patchDiagnostics({
      cameraAvailable,
      microphoneAvailable,
      cameraPermission,
      microphonePermission,
    });
  }, [patchDiagnostics]);

  useEffect(() => {
    audioOnlyRef.current = audioOnly;
  }, [audioOnly]);

  useEffect(() => {
    onDiagnosticsChange?.(diagnostics);
  }, [diagnostics, onDiagnosticsChange]);

  useEffect(() => {
    onParticipantsChange?.(participants);
  }, [participants, onParticipantsChange]);

  useEffect(() => {
    void loadJitsiScript()
      .then(() => setScriptStatus("ready"))
      .catch(() => {
        setScriptStatus("error");
        setPermissionError("Video service failed to load. Use Open class in new tab while we retry.");
      });
    void refreshDiagnostics();
  }, [refreshDiagnostics]);

  const startConference = () => {
    if (!containerRef.current || !window.JitsiMeetExternalAPI || apiRef.current) return;

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
      iframeAttrs: {
        allow: iframeAllow,
        allowfullscreen: "true",
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
    onApiReady?.(api);
    setStarted(true);

    const iframe = api.getIFrame?.() ?? containerRef.current.querySelector("iframe");
    iframe?.setAttribute(
      "allow",
      iframeAllow,
    );
    iframe?.setAttribute("allowfullscreen", "true");

    window.setTimeout(() => {
      try {
        api.executeCommand("unmuteAudio");
        if (audioOnlyRef.current) api.executeCommand("muteVideo");
      } catch {
        /* ignore */
      }
    }, 1500);

    api.addListener("micError", (d: unknown) => {
      addJitsiMessage(describeJitsiPayload("Jitsi microphone error", d));
      patchDiagnostics({ microphoneAvailable: "blocked", microphonePermission: "denied" });
      setPermissionError(
        "Microphone did not start. Tap the lock icon in the address bar and allow microphone access.",
      );
    });
    api.addListener("cameraError", (d: unknown) => {
      addJitsiMessage(describeJitsiPayload("Jitsi camera error", d));
      patchDiagnostics({ cameraAvailable: "blocked", cameraPermission: "denied" });
      setPermissionError(
        "Camera did not start. Tap the lock icon in the address bar and allow camera access.",
      );
    });
    api.addListener("audioAvailabilityChanged", (d: unknown) => {
      const data = d as { available?: boolean };
      patchDiagnostics({ microphoneAvailable: data.available === false ? "missing" : "available" });
    });
    api.addListener("videoAvailabilityChanged", (d: unknown) => {
      const data = d as { available?: boolean };
      patchDiagnostics({ cameraAvailable: data.available === false ? "missing" : "available" });
    });
    api.addListener("readyToClose", () => addJitsiMessage("Jitsi meeting window closed"));

    api.addListener("videoConferenceJoined", (d: unknown) => {
      const data = d as { id: string; displayName?: string };
      setParticipants((p) => {
        const next = p.filter((x) => x.id !== data.id);
        return [
          ...next,
          {
            id: data.id,
            displayName: data.displayName ?? displayName ?? "You",
            status: "joined",
          },
        ];
      });
    });
    api.addListener("participantJoined", (d: unknown) => {
      const data = d as { id: string; displayName?: string };
      setParticipants((p) => {
        const next = p.filter((x) => x.id !== data.id);
        return [
          ...next,
          { id: data.id, displayName: data.displayName ?? "Guest", status: "connecting" },
        ];
      });
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
        p.map((x) =>
          x.id === data.id ? { ...x, displayName: data.displayname ?? x.displayName } : x,
        ),
      );
    });
    api.addListener("videoConferenceLeft", () => {
      setParticipants([]);
    });
  };

  const requestMediaAndStart = async () => {
    setPermissionError(null);
    if (scriptStatus !== "ready") {
      setPermissionError(
        scriptStatus === "error"
          ? "Video service failed to load. Use Open class in new tab, then try again here."
          : "Video service is still loading. Try again in a moment.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser cannot access the camera or microphone.");
      patchDiagnostics({
        cameraAvailable: "unavailable",
        microphoneAvailable: "unavailable",
        cameraPermission: "unavailable",
        microphonePermission: "unavailable",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      patchDiagnostics({
        cameraAvailable: "available",
        microphoneAvailable: "available",
        cameraPermission: "granted",
        microphonePermission: "granted",
      });
      startConference();
      void refreshDiagnostics();
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        patchDiagnostics({
          cameraAvailable: "blocked",
          microphoneAvailable: "blocked",
          cameraPermission: "denied",
          microphonePermission: "denied",
        });
        setPermissionError(
          "Camera or microphone is blocked. Tap the lock icon in the address bar, allow camera and microphone, then tap Start again.",
        );
      } else if (name === "NotFoundError") {
        patchDiagnostics({ cameraAvailable: "missing", microphoneAvailable: "missing" });
        setPermissionError("No camera or microphone was found on this device.");
      } else if (name === "NotReadableError") {
        patchDiagnostics({ cameraAvailable: "in-use", microphoneAvailable: "in-use" });
        setPermissionError(
          "Camera or microphone is already in use by another app. Close the other app, then try again.",
        );
      } else {
        patchDiagnostics({ cameraAvailable: "unknown", microphoneAvailable: "unknown" });
        setPermissionError(
          "Camera and microphone could not start. Check browser permissions and try again.",
        );
      }
    }
  };

  const startWithoutPreview = async () => {
    setPermissionError(null);
    try {
      if (scriptStatus !== "ready") {
        setPermissionError("Video service is still loading. Try again in a moment.");
        return;
      }
      startConference();
    } catch (err) {
      setPermissionError(err instanceof Error ? err.message : "Video service failed to load.");
    }
  };

  useEffect(() => {
    if (!apiRef.current) return;
    try {
      apiRef.current.executeCommand("unmuteAudio");
      apiRef.current.executeCommand(audioOnly ? "muteVideo" : "unmuteVideo");
    } catch {
      /* ignore */
    }
  }, [audioOnly]);

  useEffect(
    () => () => {
      apiRef.current?.dispose();
      apiRef.current = null;
      onApiReady?.(null);
      setParticipants([]);
    },
    [onApiReady],
  );

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full bg-background"
      >
        {!started && (
          <div className="flex h-full w-full items-center justify-center p-4">
          <div className="flex max-w-xs flex-col items-center gap-3 text-center">
            {nested && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
                <p className="font-semibold">
                  Audio &amp; video may not work in the preview frame.
                </p>
                <p className="mt-1 opacity-90">
                  Browsers block camera and microphone inside nested previews. Open the live class
                  in a new tab for full audio/video.
                </p>
                <Button asChild size="sm" className="mt-2 w-full">
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" /> Open class in new tab
                  </a>
                </Button>
              </div>
            )}
            <Button onClick={requestMediaAndStart} className="w-full">
              <Video className="mr-2 h-4 w-4" /> Start camera and mic
            </Button>
            <Button onClick={startWithoutPreview} variant="outline" className="w-full">
              Join with in-call permission prompt
            </Button>
            {permissionError && <p className="text-xs text-destructive">{permissionError}</p>}
          </div>
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
