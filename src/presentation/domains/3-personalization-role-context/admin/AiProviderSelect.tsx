import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { updatePlatformConfig } from "@/application/use-cases/admin/config-management";
import { Label } from "../../8-core-ux-navigation/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../8-core-ux-navigation/ui/select";
import { usePlatformConfig, type AiProvider } from "../hooks/use-platform-config";

const OPTIONS: { value: AiProvider; label: string; hint: string }[] = [
  { value: "groq", label: "Groq", hint: "Requires GROQ_API_KEY (or a key saved below)." },
  { value: "gemini", label: "Google Gemini (default)", hint: "Requires GEMINI_API_KEY (or a key saved below)." },
  { value: "ollama", label: "Ollama (self-hosted)", hint: "Requires OLLAMA_BASE_URL." },
];

export function AiProviderSelect() {
  const { config } = usePlatformConfig();
  const qc = useQueryClient();
  const updateConfig = useServerFn(updatePlatformConfig);
  const current = config.ai_provider;
  const currentHint = OPTIONS.find((o) => o.value === current)?.hint ?? "";

  const onChange = async (v: string) => {
    await updateConfig({ data: { patch: { ai_provider: v } } });
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
