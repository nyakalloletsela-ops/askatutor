import { X, FileDown, Save, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClassroomChat } from "./ClassroomChat";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { ClassroomFiles } from "@/components/ClassroomFiles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export type SidePanelKey = "chat" | "files" | "notes" | "ai";

export type UsedLab = { name: string; url: string };

interface Props {
  open: SidePanelKey;
  onChange: (open: SidePanelKey | null) => void;
  roomId: string;
  userId: string;
  displayName: string;
  usedLabs: UsedLab[];
}

export function ClassroomSidePanel({ open, onChange, roomId, userId, displayName, usedLabs }: Props) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col border-l bg-card">
      <Tabs value={open} onValueChange={(v) => onChange(v as SidePanelKey)} className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-2 border-b px-2 py-2">
          <TabsList className="grid flex-1 grid-cols-4">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
          </TabsList>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => onChange(null)} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <TabsContent value="chat" className="m-0 min-h-0 flex-1">
          <ClassroomChat roomId={roomId} userId={userId} displayName={displayName} />
        </TabsContent>
        <TabsContent value="files" className="m-0 min-h-0 flex-1 overflow-auto">
          <ClassroomFiles roomId={roomId} />
        </TabsContent>
        <TabsContent value="notes" className="m-0 min-h-0 flex-1">
          <NotesTab roomId={roomId} displayName={displayName} usedLabs={usedLabs} />
        </TabsContent>
        <TabsContent value="ai" className="m-0 min-h-0 flex-1">
          <AIAssistantPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotesTab({ roomId, displayName, usedLabs }: { roomId: string; displayName: string; usedLabs: UsedLab[] }) {
  const key = `classroom-notes:${roomId}`;
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { setValue(localStorage.getItem(key) ?? ""); } catch { /* */ }
  }, [key]);
  useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem(key, value); } catch { /* */ } }, 300);
    return () => clearTimeout(id);
  }, [key, value]);

  const buildPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    doc.setFontSize(16);
    doc.text("Lesson notes", margin, y);
    y += 20;
    doc.setFontSize(10);
    doc.text(`${displayName} — ${new Date().toLocaleString()}`, margin, y);
    y += 24;

    doc.setFontSize(11);
    for (const line of doc.splitTextToSize(value || "(empty)", width) as string[]) {
      if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 15;
    }

    if (usedLabs.length) {
      y += 14;
      if (y > doc.internal.pageSize.getHeight() - margin - 40) { doc.addPage(); y = margin; }
      doc.setFontSize(13);
      doc.text("Labs used in this lesson", margin, y);
      y += 18;
      doc.setFontSize(10);
      for (const lab of usedLabs) {
        if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
        doc.textWithLink(`• ${lab.name} — ${lab.url}`, margin, y, { url: lab.url });
        y += 14;
      }
    }
    return doc;
  };

  const download = async () => {
    setBusy(true);
    try {
      const doc = await buildPdf();
      doc.save(`lesson-notes-${roomId}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create PDF");
    } finally {
      setBusy(false);
    }
  };

  const saveShared = async () => {
    setBusy(true);
    try {
      const doc = await buildPdf();
      const blob = doc.output("blob") as Blob;
      const path = `${roomId}/notes/${Date.now()}-notes-${displayName.replace(/[^a-zA-Z0-9]+/g, "_")}.pdf`;
      const { error } = await supabase.storage
        .from("classroom-files")
        .upload(path, blob, { contentType: "application/pdf", upsert: false });
      if (error) throw error;
      toast.success("Notes PDF saved to class files — visible to both of you");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save notes");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted-foreground">Auto-saved on this device. Save as PDF to share.</p>
        <div className="ml-auto flex gap-1.5">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void download()}>
            {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <FileDown className="mr-1 h-3.5 w-3.5" />} PDF
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void saveShared()}>
            <Save className="mr-1 h-3.5 w-3.5" /> Save to class
          </Button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Take notes during the lesson…"
        className="min-h-0 flex-1 resize-none rounded-xl border bg-background p-3 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/40"
      />
      <div className="mt-2 shrink-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Labs used</p>
        {usedLabs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No labs opened yet.</p>
        ) : (
          <ul className="max-h-28 space-y-1 overflow-auto">
            {usedLabs.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> {l.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
