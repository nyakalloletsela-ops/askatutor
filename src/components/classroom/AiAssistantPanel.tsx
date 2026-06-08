import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askClassroomAi } from "@/lib/classroom-ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, GraduationCap, UserCog } from "lucide-react";
import { toast } from "sonner";

interface Msg {
  role: "user" | "assistant";
  content: string;
  suggestions?: { kind: "text"; value: string }[];
}

interface Props {
  roomId: string;
  defaultTutorMode: boolean;
  onInsertToBoard: (text: string) => void;
}

export function AiAssistantPanel({ roomId, defaultTutorMode, onInsertToBoard }: Props) {
  const [mode, setMode] = useState<"student" | "tutor">(defaultTutorMode ? "tutor" : "student");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const ask = useServerFn(askClassroomAi);

  const send = async () => {
    const content = draft.trim();
    if (!content || busy) return;
    const userMsg: Msg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setDraft("");
    setBusy(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const res = await ask({
        data: {
          roomId,
          mode,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.text, suggestions: res.suggestions },
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-l bg-card">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" /> AI Assistant
        </div>
        <div className="flex overflow-hidden rounded-md border text-xs">
          <button
            onClick={() => setMode("student")}
            className={`flex items-center gap-1 px-2 py-1 ${
              mode === "student" ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <GraduationCap className="h-3 w-3" /> Student
          </button>
          <button
            onClick={() => setMode("tutor")}
            className={`flex items-center gap-1 px-2 py-1 ${
              mode === "tutor" ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <UserCog className="h-3 w-3" /> Tutor
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {mode === "student"
              ? "Ask for a hint — the AI will guide you, not solve it for you."
              : "Ask for full solutions, quizzes or content to drop on the board."}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-full whitespace-pre-wrap rounded-lg px-3 py-2 ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {m.content}
            </div>
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {m.suggestions.map((s, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    className="h-6 text-[11px]"
                    onClick={() => onInsertToBoard(s.value)}
                  >
                    Insert: {s.value.slice(0, 32)}
                    {s.value.length > 32 ? "…" : ""}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && <div className="text-xs text-muted-foreground">Thinking…</div>}
      </div>

      <form
        className="flex gap-2 border-t p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={mode === "student" ? "Ask for a hint…" : "Ask anything…"}
          rows={2}
          maxLength={8000}
          className="min-h-0 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <Button type="submit" size="icon" disabled={busy || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
