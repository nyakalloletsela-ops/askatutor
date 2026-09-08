import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type TutorRow = { id: string; subjects: string[] | null };
type ActivityEvent = { id: string; emoji: string; text: string };

function subjectEmoji(s: string) {
  const k = s.toLowerCase();
  if (k.includes("math")) return "\u{1F4DA}";
  if (k.includes("phys")) return "\u{1F52D}";
  if (k.includes("chem")) return "\u{1F9EA}";
  if (k.includes("bio")) return "\u{1F9EC}";
  if (k.includes("eng") || k.includes("lit")) return "\u{1F4D6}";
  if (k.includes("cod") || k.includes("prog") || k.includes("comp")) return "\u{1F4BB}";
  if (k.includes("bus") || k.includes("econ")) return "\u{1F4BC}";
  return "\u{1F393}";
}

export function ActivityTicker() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("list_public_tutors");
      if (cancelled || error) return;
      const rows = (data as TutorRow[]) ?? [];
      const subjects = Array.from(new Set(rows.flatMap((r) => r.subjects ?? []))).slice(0, 8);
      if (subjects.length === 0) return;
      setEvents(
        subjects.map((s, i) => ({
          id: `${s}-${i}`,
          emoji: subjectEmoji(s),
          text: `${s} tutor available now`,
        })),
      );
    })();
    return () => { cancelled = true; };
  }, []);

  if (events.length === 0) return null;

  const loop = [...events, ...events];

  return (
    <div className="border-b border-border/60 bg-muted/20 py-2.5 overflow-hidden">
      <div className="flex gap-6 whitespace-nowrap animate-[ticker_40s_linear_infinite]">
        {loop.map((e, i) => (
          <span key={`${e.id}-${i}`} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden>{e.emoji}</span>
            <span>{e.text}</span>
            <span className="mx-3 text-border">&middot;</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
