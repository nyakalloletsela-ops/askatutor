import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyScopes, type FeatureScope } from "@/lib/entitlements.functions";
import { useAuth } from "@/hooks/use-auth";
import { usePlatformConfig } from "@/hooks/use-platform-config";

export function useEntitlements() {
  const { user, isAdmin, isTutor } = useAuth();
  const { config } = usePlatformConfig();
  const subscriptionsEnabled = config.is_subscriptions_enabled;
  const fetchScopes = useServerFn(getMyScopes);
  const q = useQuery({
    queryKey: ["my-scopes", user?.id],
    queryFn: () => fetchScopes(),
    enabled: !!user && subscriptionsEnabled,
    staleTime: 60_000,
  });
  const scopes: FeatureScope[] = (q.data as FeatureScope[] | undefined) ?? [];
  // When subscriptions are disabled platform-wide, all gated features are
  // open to everyone — otherwise students with no active plan get blocked
  // from booking tutors, AI tools, labs, etc.
  const hasScope = (s: FeatureScope) =>
    !subscriptionsEnabled || isAdmin || isTutor || scopes.includes(s);
  return {
    scopes,
    hasScope,
    loading: subscriptionsEnabled ? q.isLoading : false,
    refetch: q.refetch,
  };
}
