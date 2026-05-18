import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Sub = {
  id: string;
  tutor_id: string;
  transaction_ref: string;
  payment_method: string;
  status: string;
  submitted_at: string;
};

type TutorProfile = {
  id: string;
  full_name: string | null;
  is_featured: boolean;
  subjects: string[] | null;
};

function AdminPage() {
  const { isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [profiles, setProfiles] = useState<Record<string, TutorProfile>>({});
  const [allTutors, setAllTutors] = useState<TutorProfile[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const load = async () => {
    const { data: s } = await supabase
      .from("tutor_subscriptions")
      .select("*")
      .order("submitted_at", { ascending: false });
    setSubs((s as Sub[]) ?? []);
    const ids = (s ?? []).map((x) => x.tutor_id);
    if (ids.length) {
      const { data: pr } = await supabase
        .from("profiles")
        .select("id, full_name, is_featured, subjects")
        .in("id", ids);
      const map: Record<string, TutorProfile> = {};
      (pr ?? []).forEach((p) => (map[p.id] = p as TutorProfile));
      setProfiles(map);
    }
    const { data: tr } = await supabase.from("user_roles").select("user_id").eq("role", "tutor");
    const tids = (tr ?? []).map((r) => r.user_id);
    if (tids.length) {
      const { data: at } = await supabase
        .from("profiles")
        .select("id, full_name, is_featured, subjects")
        .in("id", tids);
      setAllTutors((at as TutorProfile[]) ?? []);
    }
  };

  const approve = async (sub: Sub) => {
    if (!user) return;
    const { error: e1 } = await supabase
      .from("tutor_subscriptions")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id })
      .eq("id", sub.id);
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 30);
    const { error: e2 } = await supabase
      .from("profiles")
      .update({ is_featured: true, featured_until: featuredUntil.toISOString() })
      .eq("id", sub.tutor_id);
    if (e1 || e2) toast.error((e1 || e2)!.message);
    else {
      toast.success("Approved — tutor is now featured");
      load();
    }
  };

  const reject = async (sub: Sub) => {
    const { error } = await supabase
      .from("tutor_subscriptions")
      .update({ status: "rejected" })
      .eq("id", sub.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Rejected");
      load();
    }
  };

  const toggleFeatured = async (p: TutorProfile, v: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_featured: v, featured_until: v ? new Date(Date.now() + 30 * 86400000).toISOString() : null })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success(v ? "Featured" : "Removed from featured");
      load();
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold text-navy">Admin</h1>

        <Card>
          <CardHeader>
            <CardTitle>Pending subscription payments</CardTitle>
          </CardHeader>
          <CardContent>
            {subs.filter((s) => s.status === "pending").length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing pending.</p>
            ) : (
              <ul className="divide-y">
                {subs
                  .filter((s) => s.status === "pending")
                  .map((s) => (
                    <li key={s.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">
                          {profiles[s.tutor_id]?.full_name ?? "Unknown tutor"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ref <span className="font-mono">{s.transaction_ref}</span> ·{" "}
                          {s.payment_method.toUpperCase()} · M100
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approve(s)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reject(s)}>
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All tutors — Featured toggle</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {allTutors.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{t.full_name ?? "Unnamed"}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(t.subjects ?? []).map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    Featured
                    <Switch
                      checked={t.is_featured}
                      onCheckedChange={(v) => toggleFeatured(t, v)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
