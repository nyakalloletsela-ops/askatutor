import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/access.functions";
import { PageContainer, StatCard } from "@/components/dashboard/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: PaymentsPage,
});

function PaymentsPage() {
  const { data } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const [students, tutors] = await Promise.all([
        supabase
          .from("student_subscriptions")
          .select("*")
          .order("submitted_at", { ascending: false })
          .limit(100),
        supabase
          .from("tutor_subscriptions")
          .select("*")
          .order("submitted_at", { ascending: false })
          .limit(100),
      ]);
      const all = [
        ...(students.data ?? []).map((s) => ({ ...s, kind: "student" as const })),
        ...(tutors.data ?? []).map((s) => ({ ...s, kind: "tutor" as const })),
      ].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      const totalApproved = all.filter((x) => x.status === "approved").reduce((s, x) => s + Number(x.amount), 0);
      const pending = all.filter((x) => x.status === "pending").length;
      const rejected = all.filter((x) => x.status === "rejected").length;
      return { all, totalApproved, pending, rejected };
    },
  });

  return (
    <PageContainer title="Payments" description="Subscription transactions across the platform.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Total approved" value={`M ${data?.totalApproved ?? 0}`} />
        <StatCard icon={CheckCircle2} label="Approved" value={data?.all.filter((x) => x.status === "approved").length ?? 0} />
        <StatCard icon={Clock} label="Pending" value={data?.pending ?? 0} />
        <StatCard icon={XCircle} label="Rejected" value={data?.rejected ?? 0} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {(data?.all ?? []).map((row) => (
              <div key={`${row.kind}-${row.id}`} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.transaction_ref}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.kind} · {row.payment_method} · {new Date(row.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-medium">M {row.amount}</span>
                  <Badge
                    variant={
                      row.status === "approved" ? "default" : row.status === "pending" ? "secondary" : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {row.status}
                  </Badge>
                </div>
              </div>
            ))}
            {!data?.all.length && (
              <p className="p-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
