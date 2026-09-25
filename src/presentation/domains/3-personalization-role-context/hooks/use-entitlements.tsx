import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyScopes, type FeatureScope } from "@/lib/entitlements.functions";
import { useAuth } from "../hooks/use-auth";
import { usePlatformConfig } from "./use-platform-config";
import { resolveScopeAccess } from "../resolve-scope-access";

export function useEntitlements() {
  const { user, isAdmin, isTutor } = useAuth();
  const { config, isLoading: configLoading, isError: configError } = usePlatformConfig();
  const subscriptionsEnabled = config.is_subscriptions_enabled;
  const isPrivileged = isAdmin || isTutor;
  const fetchScopes = useServerFn(getMyScopes);
  const q = useQuery({
    queryKey: ["my-scopes", user?.id],
    queryFn: () => fetchScopes(),
    enabled: !!user && !configLoading && !configError && subscriptionsEnabled && !isPrivileged,
    staleTime: 60_000,
  });
  const scopes: FeatureScope[] = (q.data as FeatureScope[] | undefined) ?? [];
  const hasScope = (scope: FeatureScope) =>
    resolveScopeAccess({
      scope,
      configAvailable: !configLoading && !configError,
      subscriptionsEnabled,
      isAdmin,
      isTutor,
      scopes,
      scopesAvailable: !q.isError && (!subscriptionsEnabled || isPrivileged || !q.isLoading),
    });
  const verificationError = configError || (subscriptionsEnabled && !isPrivileged && q.isError);
  return {
    scopes,
    hasScope,
    loading: configLoading || (subscriptionsEnabled && !isPrivileged && q.isLoading),
    verificationError,
    refetch: q.refetch,
  };
}
