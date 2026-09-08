import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../8-core-ux-navigation/ui/card";
import { Input } from "../../8-core-ux-navigation/ui/input";
import { Label } from "../../8-core-ux-navigation/ui/label";
import { Button } from "../../8-core-ux-navigation/ui/button";
import { Loader2, Search } from "lucide-react";

export type TutorPricing = { id: string; full_name: string; hourly_rate: number; currency: string };

interface TutorLookupProps {
  onFound: (pricing: TutorPricing) => void;
}

export function TutorLookup({ onFound }: TutorLookupProps) {
  const [tutorId, setTutorId] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!tutorId.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_tutor_pricing", { _tutor: tutorId.trim() });
    setLoading(false);
    if (error) return toast.error(error.message);
    const row = (data as TutorPricing[] | null)?.[0];
    if (!row) return toast.error("Tutor not found");
    if (!row.hourly_rate || Number(row.hourly_rate) <= 0) {
      return toast.error("This tutor has no hourly rate set yet");
    }
    onFound(row);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-4 w-4" /> Step 1 — Find your tutor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="tid">Tutor ID</Label>
        <div className="flex gap-2">
          <Input
            id="tid"
            placeholder="paste tutor id (UUID)"
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
          />
          <Button onClick={lookup} disabled={loading || !tutorId.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look up"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
