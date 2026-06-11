import { useState } from "react";
import * as Y from "yjs";
import { Circle, Square, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecorder } from "./useRecorder";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

export function RecordingBar({
  roomId,
  userId,
  doc,
}: {
  roomId: string;
  userId: string;
  doc: Y.Doc;
}) {
  const { isRecording, sessionId, elapsedMs, start, stop } = useRecorder(roomId, doc, userId);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStop = async () => {
    const sid = sessionId;
    await stop();
    if (sid) setLastSessionId(sid);
  };

  const reviewUrl = lastSessionId ? `${window.location.origin}/whiteboard-review/${lastSessionId}` : null;

  return (
    <div className="pointer-events-auto absolute left-1/2 top-2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-background/90 px-2 py-1 text-xs shadow backdrop-blur">
      {isRecording ? (
        <>
          <span className="flex items-center gap-1 text-red-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            REC {fmt(elapsedMs)}
          </span>
          <Button size="sm" variant="destructive" className="h-6 px-2" onClick={handleStop}>
            <Square className="mr-1 h-3 w-3 fill-current" /> Stop
          </Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => void start()}>
          <Circle className="mr-1 h-3 w-3 fill-red-500 text-red-500" /> Record
        </Button>
      )}
      {reviewUrl && !isRecording && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2"
          onClick={async () => {
            await navigator.clipboard.writeText(reviewUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          <LinkIcon className="mr-1 h-3 w-3" />
          {copied ? "Copied" : "Copy review link"}
        </Button>
      )}
    </div>
  );
}
