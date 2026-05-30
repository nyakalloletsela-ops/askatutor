import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StickyNote, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, EmptyState } from "@/components/dashboard/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/notes")({
  component: NotesPage,
});

type Note = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
};

function NotesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data: notes = [] } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Note[];
    },
    enabled: !!user,
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user || !title.trim()) throw new Error("Title required");
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title: title.trim(),
        body: body.trim() || null,
        kind: "note",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setTitle("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  return (
    <PageContainer title="Notes" description="Personal notes and bookmarks.">
      <Card>
        <CardContent className="space-y-2 p-4">
          <Input
            placeholder="Note title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write something…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={() => add.mutate()} disabled={add.isPending}>
              <Plus className="mr-1 h-4 w-4" /> Add note
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <EmptyState icon={StickyNote} title="No notes yet" description="Capture ideas, summaries, or bookmarks." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <Card key={n.id} className="group">
              <CardContent className="space-y-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => del.mutate(n.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {n.body && <p className="whitespace-pre-wrap text-xs text-muted-foreground">{n.body}</p>}
                <p className="text-[10px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
