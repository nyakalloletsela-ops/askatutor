import { Card, CardContent, CardHeader, CardTitle } from "../../8-core-ux-navigation/ui/card";
import { Input } from "../../8-core-ux-navigation/ui/input";
import { Label } from "../../8-core-ux-navigation/ui/label";
import { Button } from "../../8-core-ux-navigation/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../8-core-ux-navigation/ui/select";
import { Loader2, Wallet } from "lucide-react";
import type { TutorPricing } from "./TutorLookup";

interface BulkLessonConfigProps {
  pricing: TutorPricing;
  lessons: number;
  setLessons: (n: number) => void;
  minutes: number;
  setMinutes: (n: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function BulkLessonConfig({
  pricing,
  lessons,
  setLessons,
  minutes,
  setMinutes,
  onSubmit,
  submitting,
}: BulkLessonConfigProps) {
  const total = Number(pricing.hourly_rate) * (minutes / 60) * lessons;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Step 2 — Lessons</CardTitle>
        <p className="text-sm text-muted-foreground">
          {pricing.full_name} · ${Number(pricing.hourly_rate).toFixed(2)}/hr
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Number of lessons</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={lessons}
              onChange={(e) => setLessons(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div>
            <Label>Lesson length</Label>
            <Select value={String(minutes)} onValueChange={(v) => setMinutes(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="90">90 min</SelectItem>
                <SelectItem value="120">120 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {lessons} × {minutes} min × ${Number(pricing.hourly_rate).toFixed(2)}/hr
            </span>
            <span className="text-xl font-bold">${total.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Includes a 5% platform commission. Your tutor gets ${(total * 0.95).toFixed(2)}.
          </p>
        </div>

        <Button onClick={onSubmit} disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
          Create payment request
        </Button>
        <p className="text-xs text-muted-foreground">
          After paying, an admin will confirm and your lessons will be credited. You can then book
          that many sessions with your tutor without paying again.
        </p>
      </CardContent>
    </Card>
  );
}
