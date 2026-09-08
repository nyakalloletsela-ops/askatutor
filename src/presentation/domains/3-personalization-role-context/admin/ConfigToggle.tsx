import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { updatePlatformConfig } from "@/application/use-cases/admin/config-management";
import { Switch } from "../../8-core-ux-navigation/ui/switch";
import { Label } from "../../8-core-ux-navigation/ui/label";
import { Input } from "../../8-core-ux-navigation/ui/input";
import { Button } from "../../8-core-ux-navigation/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { usePlatformConfig, type PlatformConfig } from "../hooks/use-platform-config";

type Key = keyof PlatformConfig;

export function ConfigToggle({
  k,
  label,
  description,
}: {
  k: Key;
  label: string;
  description?: string;
}) {
  const { config } = usePlatformConfig();
  const qc = useQueryClient();
  const updateConfig = useServerFn(updatePlatformConfig);
  const value = config[k];

  const update = async (v: boolean | number) => {
    const patch = { [k]: v } as Record<string, string | number | boolean | null>;
    await updateConfig({ data: { patch } });
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["platform-config"] });
  };

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-md border bg-card/40 p-3">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Switch checked={value} onCheckedChange={update} />
      </div>
    );
  }

  // number
  return <NumberRow k={k} label={label} description={description} initial={value as number} onSave={update} />;
}

function NumberRow({
  label,
  description,
  initial,
  onSave,
}: {
  k: Key;
  label: string;
  description?: string;
  initial: number;
  onSave: (n: number) => void;
}) {
  const [val, setVal] = useState(String(initial));
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-card/40 p-3">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-32"
      />
      <Button size="sm" onClick={() => onSave(Number(val))}>
        Save
      </Button>
    </div>
  );
}
