import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aiTutorChat } from "@/lib/ai-tutor.functions";

export const Route = createFileRoute("/_authenticated/ai-tutor")({
  component: AiTutorPage,
  head: () => ({
    meta: [
      { title: "AI Study Coach — Ask A Tutor" },
      {
        name: "description",
        content:
          "Premium AI study coach that guides you to the answer with hints and concepts — never the full solution.",
      },
    ],
  }),
});

type Msg = { role: "user" | "assistant"; content: string };

function AiTutorPage() {
  const send = useServerFn(aiTutorChat);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI Study Coach. Tell me the subject and the problem you're stuck on — I'll guide you with hints and concepts, not full answers. What are you working on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await send({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply || "…" }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages(next.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">AI Study Coach</h1>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Premium · 24/7
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        I guide — I don't solve. Expect questions back, hints, and concept explanations.
      </p>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="inline h-4 w-4 animate-spin" /> thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t p-2">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Describe what you're stuck on…"
              rows={2}
              className="min-h-[44px] resize-none"
              disabled={loading}
            />
            <Button onClick={submit} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
