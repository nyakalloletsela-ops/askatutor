import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { saveAiKey, getAiKeyStatus, testAiProvider } from "@/lib/ai/keys.functions";

type Provider = "groq" | "gemini" | "ollama";
type Status = { hasKey: boolean; fromEnv: boolean; updated_at: string | null; base_url: string | null };

const META: Record<Provider, { label: string; keyLabel: string; placeholder: string; needsBaseUrl?: boolean; keyless?: boolean }> = {
  groq: { label: "Groq", keyLabel: "GROQ_API_KEY", placeholder: "gsk_..." },
  gemini: { label: "Google Gemini", keyLabel: "GEMINI_API_KEY", placeholder: "AIza..." },
  ollama: { label: "Ollama (self-hosted)", keyLabel: "OLLAMA_BASE_URL", placeholder: "http://localhost:11434", needsBaseUrl: true, keyless: true },
};

export function AiKeyManager() {
  const save = useServerFn(saveAiKey);
  const status = useServerFn(getAiKeyStatus);
  const test = useServerFn(testAiProvider);

  const [statuses, setStatuses] = useState<Record<Provider, Status> | null>(null);
  const [values, setValues] = useState<Record<Provider, { api_key: string; base_url: string }>>({
    groq: { api_key: "", base_url: "" },
    gemini: { api_key: "", base_url: "" },
    ollama: { api_key: "", base_url: "" },
  });
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const refresh = async () => {
    try {
      const s = await status();
      setStatuses(s as Record<Provider, Status>);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load key status");
    }
  };
  useEffect(() => {
    refresh();
  }, []);

  const onSave = async (p: Provider) => {
    setBusy((b) => ({ ...b, [`save-${p}`]: true }));
    try {
      const meta = META[p];
      await save({
        data: {
          provider: p,
          api_key: meta.keyless ? null : values[p].api_key || null,
          base_url: meta.needsBaseUrl ? values[p].base_url || null : null,
        },
      });
      toast.success(`${meta.label} saved`);
      setValues((v) => ({ ...v, [p]: { api_key: "", base_url: v[p].base_url } }));
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setBusy((b) => ({ ...b, [`save-${p}`]: false }));
    }
  };

  const onTest = async (p: Provider) => {
    setBusy((b) => ({ ...b, [`test-${p}`]: true }));
    try {
      const r = (await test({ data: { provider: p } })) as { ok: boolean; message?: string; error?: string };
      if (r.ok) toast.success(r.message ?? "Connection OK");
      else toast.error(r.error ?? "Connection failed");
    } catch (e: any) {
      toast.error(e?.message ?? "Test failed");
    } finally {
      setBusy((b) => ({ ...b, [`test-${p}`]: false }));
    }
  };

  return (
    <div className="space-y-3 rounded-md border bg-card/40 p-4">
      <div>
        <h3 className="text-sm font-semibold">Provider API keys</h3>
        <p className="text-xs text-muted-foreground">
          Values saved here override environment secrets and take effect within ~30 seconds. Keys are stored in an admin-only database table.
        </p>
      </div>

      {(Object.keys(META) as Provider[]).map((p) => {
        const meta = META[p];
        const st = statuses?.[p];
        return (
          <div key={p} className="space-y-2 rounded-md border bg-background/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{meta.label}</span>
                {st?.hasKey ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {st.fromEnv ? "env" : "saved"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <XCircle className="h-3 w-3" /> not set
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTest(p)}
                disabled={busy[`test-${p}`]}
              >
                {busy[`test-${p}`] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test connection"}
              </Button>
            </div>

            {!meta.keyless && (
              <div>
                <Label className="text-xs">{meta.keyLabel}</Label>
                <Input
                  type="password"
                  autoComplete="off"
                  placeholder={st?.hasKey ? "•••••••• (leave blank to keep)" : meta.placeholder}
                  value={values[p].api_key}
                  onChange={(e) => setValues((v) => ({ ...v, [p]: { ...v[p], api_key: e.target.value } }))}
                />
              </div>
            )}
            {meta.needsBaseUrl && (
              <div>
                <Label className="text-xs">Base URL</Label>
                <Input
                  placeholder={st?.base_url ?? meta.placeholder}
                  value={values[p].base_url}
                  onChange={(e) => setValues((v) => ({ ...v, [p]: { ...v[p], base_url: e.target.value } }))}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button size="sm" onClick={() => onSave(p)} disabled={busy[`save-${p}`]}>
                {busy[`save-${p}`] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
