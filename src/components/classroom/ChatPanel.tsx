import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface ChatRow {
  id: string;
  user_id: string;
  display_name: string;
  body: string;
  created_at: string;
}

interface Props {
  roomId: string;
  userId: string;
  displayName: string;
}

export function ChatPanel({ roomId, userId, displayName }: Props) {
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("classroom_chat")
        .select("id, user_id, display_name, body, created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!cancelled && data) setMessages(data as ChatRow[]);
    })();
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "classroom_chat", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((m) => [...m, payload.new as ChatRow]);
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase
      .from("classroom_chat")
      .insert({ room_id: roomId, user_id: userId, display_name: displayName, body });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b px-3 py-2 text-sm font-medium">Chat</div>
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-auto p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground">No messages yet — say hi.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.user_id === userId ? "text-right" : "text-left"}>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.display_name}</div>
            <div
              className={`inline-block max-w-[80%] rounded-lg px-3 py-1.5 ${
                m.user_id === userId ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {m.body}
            </div>
          </div>
        ))}
      </div>
      <form
        className="flex gap-2 border-t p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          disabled={sending}
          maxLength={4000}
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
