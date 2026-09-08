export function TrustMetrics({ tutorCount }: { tutorCount: number | null }) {
  const metrics: { label: string; value: string }[] = [];
  if (tutorCount != null && tutorCount > 0) {
    metrics.push({ label: "Verified tutors", value: tutorCount.toLocaleString() });
  }
  if (metrics.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card px-6 py-6 text-center">
            <div className="text-3xl font-semibold tracking-tight text-aurora tabular-nums">{m.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
