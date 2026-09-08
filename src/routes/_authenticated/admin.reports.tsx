import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/access.functions";
import { PageContainer, EmptyState } from "@/presentation/domains/8-core-ux-navigation/primitives";
import { ReportCard } from "@/presentation/domains/4-trust-safety-compliance/reports/ReportCard";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ReportsPage,
});

function ReportsPage() {
  const { data: tickets = [] } = useQuery({
    queryKey: ["admin-help"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("help_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  return (
    <PageContainer title="Reports" description="Help tickets and user reports.">
      {tickets.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No reports" />
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <ReportCard key={t.id} report={t} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
