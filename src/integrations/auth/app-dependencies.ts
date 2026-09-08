import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildAppDependencies, buildPublicDependencies } from "@/infrastructure/di";
import type { AppDependencies } from "@/application/contracts/dependencies";

/**
 * Function middleware that chains the Supabase auth middleware and builds the
 * request-scoped Application dependency graph, exposing it as `context.deps`.
 *
 * Use cases depend only on the `AppDependencies` contract — never on
 * Infrastructure directly.
 */
export const requireAppDependencies = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const deps = buildAppDependencies(context.supabase, context.userId);
    return next({ context: { deps } });
  });

/**
 * Function middleware for PUBLIC (unauthenticated) server fns — help form,
 * webhooks, unsubscribe. Builds only the public-safe dependency subset.
 */
export const requirePublicDependencies = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const deps = buildPublicDependencies();
    return next({ context: { deps } });
  },
);

export type { AppDependencies };

/**
 * Declares the shape added to server-fn/middleware context by
 * `requireAppDependencies`. Use in handlers that consume `context.deps`.
 */
export type AuthenticatedContext = {
  deps: AppDependencies;
};