import { useState } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { saveToNotes } from "@/application/use-cases/learning/save-to-notes";
import { Button } from "../../8-core-ux-navigation/ui/button";
import { useAuth } from "../../3-personalization-role-context/hooks/use-auth";

/**
 * One-tap "Save to Notes" button. Persists AI output to the notes table,
 * tagged with a `kind` so the Notes page can filter by source folder.
 * Suggested kinds: "ai-coach", "ai-tool:explain", "ai-tool:quiz", "whiteboard", etc.
 */
export function SaveToNotes({
  content,
  title,
  kind,
  size = "sm",
}: {
  content: string;
  title: string;
  kind: string;
  size?: "sm" | "xs";
}) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveNote = useServerFn(saveToNotes);

  if (!user) return null;

  const save = async () => {
    if (saving || saved) return;
    setSaving(true);
    const safeTitle = title.trim().slice(0, 120) || "Untitled";
    try {
      await saveNote({ data: { title: safeTitle, body: content, kind } });
      setSaved(true);
      toast.success("Saved to Notes");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      toast.error(`Could not save: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      type="button"
      size={size === "xs" ? "sm" : "sm"}
      variant="ghost"
      onClick={save}
      disabled={saving}
      className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
    >
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : saved ? (
        <Check className="h-3.5 w-3.5 text-neon" />
      ) : (
        <Bookmark className="h-3.5 w-3.5" />
      )}
      {saved ? "Saved" : "Save to Notes"}
    </Button>
  );
}
