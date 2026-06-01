import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/access.functions";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, SectionHeader } from "@/components/dashboard/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/tutors")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: TutorsAdmin,
});

type Application = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  submitted_at: string;
  subjects: string[];
};

function TutorsAdmin() {
  const { data: apps = [] } = useQuery({
    queryKey: ["admin-tutor-applications"],
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await supabase
        .from("tutor_applications")
        .select("id, full_name, email, status, submitted_at, subjects")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Application[];
    },
  });

  return (
    <PageContainer>
      <SectionHeader
        title="Tutor management"
        description="Approve, suspend, or verify tutor applications. Full approval flow lives in the Admin Console."
      />
      <Card>
        <CardContent className="space-y-2 p-4">
          {apps.length === 0 && <p className="text-sm text-muted-foreground">No tutor applications yet.</p>}
          {apps.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-md border bg-card/40 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{a.email}</p>
              </div>
              <Badge variant={a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "secondary"}>
                {a.status}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin">Review in console</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
