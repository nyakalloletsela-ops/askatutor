import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/access.functions";
import { PageContainer, EmptyState } from "@/presentation/domains/8-core-ux-navigation/primitives";
import { ModerationPostCard } from "@/presentation/domains/4-trust-safety-compliance/moderation/ModerationPostCard";

export const Route = createFileRoute("/_authenticated/admin/moderation")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ModerationPage,
});

function ModerationPage() {
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ["admin-forum-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_posts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Post removed");
      qc.invalidateQueries({ queryKey: ["admin-forum-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageContainer title="Moderation" description="Review and remove user-generated content.">
      {posts.length === 0 ? (
        <EmptyState icon={Flag} title="Nothing to moderate" />
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <ModerationPostCard
              key={p.id}
              post={p}
              onDelete={(id) => del.mutate(id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
