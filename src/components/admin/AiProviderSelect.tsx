import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformConfig, type AiProvider } from "@/hooks/use-platform-config";

const OPTIONS: { value: AiProvider; label: string; hint: string }[] = [
  { value: "lovable", label: "Lovable AI (default)", hint: "No key needed while running on Lovable." },
  { value: "groq", label: "Groq", hint: "Requires GROQ_API_KEY secret." },
  { value: "gemini", label: "Google Gemini", hint: "Requires GEMINI_API_KEY secret." },
  { value: "ollama", label: "Ollama (self-hosted)", hint: "Requires OLLAMA_BASE_URL secret." },
];

export function AiProviderSelect() {
  const { config } = usePlatformConfig();
  const qc = useQueryClient();
  const current = config.ai_provider;
  const currentHint = OPTIONS.find((o) => o.value === current)?.hint ?? "";

  const onChange = async (v: string) => {
    const { error } = await supabase
      .from("platform_config")
      .update({ ai_provider: v } as never)
      .eq("id", 1);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("AI provider updated");
    qc.invalidateQueries({ queryKey: ["platform-config"] });
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card/40 p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label className="text-sm font-medium">AI provider</Label>
          <p className="text-xs text-muted-foreground">
            Applies to every AI feature: tutor chat, tools, sim-lab, whiteboard OCR, agents.
          </p>
        </div>
        <Select value={current} onValueChange={onChange}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">{currentHint}</p>
    </div>
  );
}
