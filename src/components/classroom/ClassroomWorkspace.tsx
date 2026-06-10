import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Sigma, Lock } from "lucide-react";
import { toast } from "sonner";
import { convertToLatex } from "@/lib/classroom-ai.functions";
import type { TldrawBoardHandle } from "./TldrawBoard";

const TldrawBoard = lazy(() => import("./TldrawBoard").then((m) => ({ default: m.TldrawBoard })));

interface Props {
  roomId: string;
  userId: string;
  canEdit: boolean; // is tutor/admin
}

export function ClassroomWorkspace({ roomId, userId, canEdit: isTutor }: Props) {
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [latexOpen, setLatexOpen] = useState(false);
  const [latexInput, setLatexInput] = useState("");
  const [latexBusy, setLatexBusy] = useState(false);
  const [latexResult, setLatexResult] = useState("");
  const boardRef = useRef<TldrawBoardHandle>(null);
  const permChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const toLatex = useServerFn(convertToLatex);

  const effectiveCanEdit = isTutor || studentCanDraw;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("ensure_whiteboard", { _room_id: roomId });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setWhiteboardId(data as string);
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // Sync permission across participants
  useEffect(() => {
    if (!whiteboardId) return;
    const channel = supabase
      .channel(`wb-perm:${whiteboardId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "perm" }, ({ payload }) => {
        if (typeof payload?.studentCanDraw === "boolean") setStudentCanDraw(payload.studentCanDraw);
      })
      .subscribe();
    permChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      permChannelRef.current = null;
    };
  }, [whiteboardId]);

  const toggleStudent = (v: boolean) => {
    setStudentCanDraw(v);
    permChannelRef.current?.send({ type: "broadcast", event: "perm", payload: { studentCanDraw: v } });
  };

  const handleExport = async () => {
    try {
      await boardRef.current?.exportPdf(`lesson-${roomId}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  const runLatex = async () => {
    if (!latexInput.trim()) return;
    setLatexBusy(true);
    setLatexResult("");
    try {
      const { latex } = await toLatex({ data: { roomId, text: latexInput.trim() } });
      setLatexResult(latex);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setLatexBusy(false);
    }
  };

  const insertLatex = () => {
    if (!latexResult) return;
    boardRef.current?.insertText(`$$${latexResult}$$`);
    setLatexOpen(false);
    setLatexInput("");
    setLatexResult("");
    toast.success("Inserted onto whiteboard");
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-2 py-1.5 shrink-0">
        {isTutor && (
          <label className="flex items-center gap-2 text-xs font-medium">
            <Lock className="h-3.5 w-3.5" />
            Student can draw
            <Switch checked={studentCanDraw} onCheckedChange={toggleStudent} />
          </label>
        )}
        {!isTutor && (
          <span className="text-xs text-muted-foreground">
            {studentCanDraw ? "You can draw" : "Read-only — tutor controls the board"}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Dialog open={latexOpen} onOpenChange={setLatexOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={!effectiveCanEdit}>
                <Sigma className="mr-1 h-4 w-4" /> Text → LaTeX
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convert text to LaTeX</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="latex-in" className="text-xs">Plain math / equation</Label>
                  <Textarea
                    id="latex-in"
                    value={latexInput}
                    onChange={(e) => setLatexInput(e.target.value)}
                    placeholder="e.g. integral from 0 to 1 of x squared dx"
                    rows={3}
                  />
                </div>
                {latexResult && (
                  <div className="space-y-1">
                    <Label className="text-xs">LaTeX</Label>
                    <pre className="overflow-auto rounded border bg-muted p-2 text-xs">{latexResult}</pre>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={runLatex} disabled={latexBusy || !latexInput.trim()}>
                  {latexBusy ? "Converting…" : "Convert"}
                </Button>
                <Button onClick={insertLatex} disabled={!latexResult}>
                  Insert on board
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" /> Save PDF
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {whiteboardId ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading whiteboard…
              </div>
            }
          >
            <TldrawBoard
              ref={boardRef}
              whiteboardId={whiteboardId}
              userId={userId}
              canEdit={effectiveCanEdit}
            />
          </Suspense>
        ) : error ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Whiteboard unavailable for this room ({error}).
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Connecting…
          </div>
        )}
      </div>
    </div>
  );
}
