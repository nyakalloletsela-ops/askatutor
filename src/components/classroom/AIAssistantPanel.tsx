import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, FileText, BookOpen, ListChecks, Layers, HelpCircle, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiTutorChat } from "@/lib/ai-tutor.functions";
import { toast } from "sonner";

interface QuickAction {
  key: string;
  label: string;
  icon: typeof Sparkles;
  prompt: string;
}

const ACTIONS: QuickAction[] = [
  {
    key: "explain",
    label: "Explain selection",
    icon: Highlighter,
    prompt: "Explain the following classroom content in clear, student-friendly language:\n\n",
  },
  {
    key: "quiz",
    label: "Generate quiz",
    icon: HelpCircle,
    prompt: "Create a 5-question multiple-choice quiz (with answer key at the end) based on:\n\n",
  },
  {
    key: "homework",
    label: "Generate homework",
    icon: ListChecks,
    prompt: "Design a short homework assignment (4–6 questions, mix of practice and one challenge) about:\n\n",
  },
  {
    key: "summary",
    label: "Lesson summary",
    icon: FileText,
    prompt: "Write a concise lesson summary with key concepts, formulas, and one example for:\n\n",
  },
  {
    key: "flashcards",
    label: "Create flashcards",
    icon: Layers,
    prompt:
      "Produce 8 flashcards (front: question, back: short answer) on the following topic. Format as `Q: ...` / `A: ...` pairs.\n\nTopic:\n",
  },
  {
    key: "answer",
    label: "Answer question",
    icon: BookOpen,
    prompt: "Answer this student question thoroughly and clearly, with worked steps if relevant:\n\n",
  },
];

export function AIAssistantPanel() {
  const ai = useServerFn(aiTutorChat);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const runAction = (a: QuickAction) => {
    setPrompt((p) => a.prompt + (p ? p : ""));
  };

  const run = async () => {
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true);
    setResponse("");
    try {
      const result = await ai({ data: { messages: [{ role: "user", content: text }] } });
      const reply = (result as { reply?: string; content?: string }).reply ?? (result as { content?: string }).content ?? "";
      setResponse(typeof reply === "string" ? reply : JSON.stringify(reply, null, 2));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex items-center gap-2 border-b px-3 py-2.5 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" /> AI Teaching Assistant
      </div>

      <div className="grid grid-cols-2 gap-1.5 border-b bg-muted/30 p-2">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            onClick={() => runAction(a)}
            className="group flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1.5 text-left text-[11px] font-medium shadow-sm transition hover:border-primary/50 hover:bg-primary/5"
          >
            <a.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {response ? (
          <pre className="whitespace-pre-wrap break-words rounded-xl border bg-background p-3 text-xs leading-relaxed">
            {response}
          </pre>
        ) : (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Pick a quick action above or type your own request below.
          </p>
        )}
      </div>

      <div className="border-t bg-background/50 p-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask the AI assistant…"
          rows={3}
          className="resize-none text-sm"
          disabled={busy}
        />
        <Button onClick={run} disabled={busy || !prompt.trim()} className="mt-2 w-full" size="sm">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {busy ? "Thinking…" : "Generate"}
        </Button>
      </div>
    </div>
  );
}
