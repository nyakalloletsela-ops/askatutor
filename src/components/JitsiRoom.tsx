import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => {
      dispose: () => void;
    };
  }
}

interface Props {
  roomId: string;
  displayName?: string;
  email?: string;
}

export function JitsiRoom({ roomId, displayName, email }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ dispose: () => void } | null>(null);
  const [started, setStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const requestMediaAndStart = async () => {
    setPermissionError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser cannot access the camera or microphone.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
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
    if (!started) return;

    let observer: MutationObserver | null = null;

    const start = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

      // Set the iframe `allow` attribute BEFORE Jitsi finishes loading,
      // otherwise the browser blocks camera/mic in the embedded context.
      observer = new MutationObserver(() => {
        const iframe = containerRef.current?.querySelector("iframe");
        if (iframe) {
          iframe.setAttribute(
            "allow",
            "camera; microphone; display-capture; autoplay; clipboard-write; fullscreen; speaker-selection",
          );
          iframe.setAttribute("allowfullscreen", "true");
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(containerRef.current, { childList: true, subtree: true });

      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
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
    <div ref={containerRef} className="flex h-full w-full items-center justify-center bg-background">
      {!started && (
        <div className="flex max-w-64 flex-col items-center gap-3 p-4 text-center">
          <Button onClick={requestMediaAndStart}>Start camera and mic</Button>
          {permissionError && <p className="text-xs text-destructive">{permissionError}</p>}
        </div>
      )}
    </div>
  );
}
