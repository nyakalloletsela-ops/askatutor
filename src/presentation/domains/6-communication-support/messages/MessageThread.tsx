import { CardContent } from "../../8-core-ux-navigation/ui/card";
import { Button } from "../../8-core-ux-navigation/ui/button";
import { Input } from "../../8-core-ux-navigation/ui/input";
import { Send } from "lucide-react";

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onSend: () => void;
  text: string;
  setText: (text: string) => void;
}

export function MessageThread({
  messages,
  currentUserId,
  onSend,
  text,
  setText,
}: MessageThreadProps) {
  return (
    <section className="flex min-h-0 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[10px] opacity-70`}>
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={(node) => node?.scrollIntoView({ behavior: "smooth" })} />
      </div>
      <CardContent className="border-t p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
          />
          <Button type="submit" disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </section>
  );
}
