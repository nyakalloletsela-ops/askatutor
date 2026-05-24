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
    const start = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;
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
      // Ensure iframe has media permissions for camera/mic in embedded context.
      requestAnimationFrame(() => {
        const iframe = containerRef.current?.querySelector("iframe");
        if (iframe) {
          iframe.setAttribute(
            "allow",
            "camera; microphone; display-capture; autoplay; clipboard-write; fullscreen; speaker-selection",
          );
          iframe.setAttribute("allowfullscreen", "true");
        }
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
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [roomId, displayName, email]);

  return <div ref={containerRef} className="h-full w-full bg-black" />;
}
