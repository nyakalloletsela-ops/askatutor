import { useEffect, useRef } from "react";

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

  useEffect(() => {
    let observer: MutationObserver | null = null;

    const start = async () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

      // Proactively request camera/mic permissions so the browser shows the
      // prompt against the parent origin BEFORE Jitsi attempts to use them
      // inside the iframe. Without this, embedded usage often silently fails.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.warn("Camera/mic permission not granted yet:", err);
      }

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
  }, [roomId, displayName, email]);

  return <div ref={containerRef} className="h-full w-full bg-black" />;
}
