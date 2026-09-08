import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { useAuth } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, EmptyState } from "@/presentation/domains/8-core-ux-navigation/primitives";
import { Button } from "@/presentation/domains/8-core-ux-navigation/ui/button";
import { NotificationCard, Notification } from "@/presentation/domains/6-communication-support/notifications/NotificationCard";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications"] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = items.filter((i) => !i.read_at).length;

  return (
    <PageContainer
      title="Notifications"
      description={unread ? `${unread} unread` : "All caught up"}
      actions={
        unread > 0 ? (
          <Button size="sm" variant="outline" onClick={() => markAll.mutate()}>
            <Check className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onClick={() => !n.read_at && markOne.mutate(n.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
