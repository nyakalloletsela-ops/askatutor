import { Link } from "@tanstack/react-router";
import { ArrowLeft, Users, MessageSquare, Sparkles, PanelLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { fmtTimer, useSessionTimer } from "./useSessionTimer";

interface Props {
  roomId: string;
  participantsCount: number;
  onToggleLeft: () => void;
  onToggleRight: (panel: "chat" | "ai") => void;
  rightOpen: "chat" | "ai" | null;
}

export function ClassroomTopBar({
  roomId,
  participantsCount,
  onToggleLeft,
  onToggleRight,
  rightOpen,
}: Props) {
  const elapsed = useSessionTimer();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  return (
    <header className="flex items-center gap-2 border-b bg-background/95 px-2 py-2 shadow-sm backdrop-blur sm:px-4">
      <Button size="icon" variant="ghost" className="lg:hidden" onClick={onToggleLeft} aria-label="Participants">
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">Live Classroom</p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate">Room</span>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-1.5 py-px font-mono text-[10px] hover:bg-muted"
              title="Copy room code"
            >
              <span className="max-w-[10ch] truncate">{roomId}</span>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-60" />}
            </button>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="hidden items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground sm:inline-flex">
          <Users className="h-3.5 w-3.5" />
          {participantsCount}
        </span>
        <span className="hidden items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 font-mono text-xs text-muted-foreground sm:inline-flex">
          {fmtTimer(elapsed)}
        </span>

        <Button
          size="sm"
          variant={rightOpen === "chat" ? "default" : "ghost"}
          className="h-8"
          onClick={() => onToggleRight("chat")}
          aria-label="Chat"
        >
          <MessageSquare className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Chat</span>
        </Button>
        <Button
          size="sm"
          variant={rightOpen === "ai" ? "default" : "ghost"}
          className="h-8"
          onClick={() => onToggleRight("ai")}
          aria-label="AI Assistant"
        >
          <Sparkles className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">AI</span>
        </Button>

        <Button asChild size="sm" variant="outline" className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10">
          <Link to="/dashboard">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Leave
          </Link>
        </Button>
      </div>
    </header>
  );
}
