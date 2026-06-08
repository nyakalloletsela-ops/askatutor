import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Member {
  userId: string;
  displayName: string;
  color: string;
}

interface Props {
  roomId: string;
  userId: string;
  displayName: string;
}

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export function PresencePanel({ roomId, userId, displayName }: Props) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const color = COLORS[Math.abs(hash(userId)) % COLORS.length];
    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: userId } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, Array<{ displayName: string; color: string }>>;
        const next: Member[] = [];
        for (const [uid, metas] of Object.entries(state)) {
          const meta = metas[0];
          next.push({ userId: uid, displayName: meta?.displayName ?? "Guest", color: meta?.color ?? "#64748b" });
        }
        setMembers(next);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void channel.track({ displayName, color });
      });
    return () => {
      void channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, userId, displayName]);

  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-medium">
        <Users className="h-4 w-4" /> In room ({members.length})
      </div>
      <ul className="min-h-0 flex-1 overflow-auto p-2 text-sm">
        {members.length === 0 && (
          <li className="px-2 py-1 text-xs text-muted-foreground">Waiting for participants…</li>
        )}
        {members.map((m) => (
          <li key={m.userId} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
            <span className="truncate">{m.displayName}</span>
            {m.userId === userId && (
              <span className="ml-auto text-[10px] text-muted-foreground">you</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
