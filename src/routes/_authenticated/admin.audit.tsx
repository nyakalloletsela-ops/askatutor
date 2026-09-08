import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { checkIsAdmin } from "@/lib/access.functions";
import { PageContainer, SectionHeader } from "@/presentation/domains/8-core-ux-navigation/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/domains/8-core-ux-navigation/ui/card";
import { Badge } from "@/presentation/domains/8-core-ux-navigation/ui/badge";
import { RouteAuditCard, AuditStatusBadge } from "@/presentation/domains/4-trust-safety-compliance/audit/RouteAuditCard";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuditPage,
});

type RouteRow = {
  path: string;
  group: "public" | "auth" | "admin" | "api";
  status: "ok" | "warning";
  note?: string;
};

const REGISTRY: RouteRow[] = [
  { path: "/", group: "public", status: "ok" },
  { path: "/auth", group: "public", status: "ok" },
  { path: "/reset-password", group: "public", status: "ok" },
  { path: "/tutors", group: "public", status: "ok" },
  { path: "/tutor/$id", group: "public", status: "ok" },
  { path: "/community", group: "public", status: "ok" },
  { path: "/leaderboard", group: "public", status: "ok" },
  { path: "/help", group: "public", status: "ok" },
  { path: "/unsubscribe", group: "public", status: "ok" },
  { path: "/dashboard", group: "auth", status: "ok" },
  { path: "/messages", group: "auth", status: "ok" },
  { path: "/assignments", group: "auth", status: "ok" },
  { path: "/notes", group: "auth", status: "ok" },
  { path: "/notifications", group: "auth", status: "ok" },
  { path: "/calendar", group: "auth", status: "ok" },
  { path: "/resources", group: "auth", status: "ok" },
  { path: "/records", group: "auth", status: "ok" },
  { path: "/ai-tools", group: "auth", status: "ok" },
  { path: "/ai-tutor", group: "auth", status: "ok" },
  { path: "/labs", group: "auth", status: "ok" },
  { path: "/code", group: "auth", status: "ok" },
  { path: "/become-tutor", group: "auth", status: "ok" },
  { path: "/certificate", group: "auth", status: "ok" },
  { path: "/classroom/$roomId", group: "auth", status: "ok" },
  { path: "/admin", group: "admin", status: "ok" },
  { path: "/admin/audit", group: "admin", status: "ok" },
  { path: "/admin/analytics", group: "admin", status: "ok" },
  { path: "/admin/payments", group: "admin", status: "ok" },
  { path: "/admin/reports", group: "admin", status: "ok" },
  { path: "/admin/moderation", group: "admin", status: "ok" },
  { path: "/admin/promotions", group: "admin", status: "ok" },
  { path: "/admin/ai", group: "admin", status: "ok" },
  { path: "/admin/classrooms", group: "admin", status: "ok" },
  { path: "/admin/whiteboard", group: "admin", status: "ok" },
  { path: "/admin/tutors", group: "admin", status: "ok" },
  { path: "/admin/students", group: "admin", status: "ok" },
];

function AuditPage() {
  const grouped = useMemo(() => {
    const g: Record<string, RouteRow[]> = { public: [], auth: [], admin: [], api: [] };
    for (const r of REGISTRY) g[r.group].push(r);
    return g;
  }, []);
  const warnings = REGISTRY.filter((r) => r.status === "warning").length;

  return (
    <PageContainer>
      <SectionHeader
        title="Platform audit"
        description="Every registered route, grouped by access level. Use this to verify navigation coverage and spot broken links."
      />
      <div className="mb-4 flex gap-2 text-sm">
        <AuditStatusBadge warningsCount={warnings} />
        <Badge variant="outline">{REGISTRY.length} routes total</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(["public", "auth", "admin"] as const).map((g) => (
          <Card key={g}>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                {g} ({grouped[g].length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {grouped[g].map((r) => (
                <RouteAuditCard key={r.path} route={r} warningsCount={r.status === "warning" ? 1 : 0} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        This registry is hand-maintained. When you add or rename a route in <code>src/routes/</code>,
        update <code>src/routes/_authenticated/admin.audit.tsx</code> so the audit stays accurate.
      </p>
    </PageContainer>
  );
}
