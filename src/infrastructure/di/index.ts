import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AppDependencies } from "@/application/contracts/dependencies";
import { aiGateway, emailService, paymentGateway } from "@/infrastructure/adapters";
import { supabaseEntitlementGateway } from "@/infrastructure/adapters/supabase-entitlement-gateway";
import { SupabaseUserRepository } from "@/infrastructure/repositories/user-repository";
import { SupabaseSessionRepository } from "@/infrastructure/repositories/session-repository";
import { SupabaseTutorRepository } from "@/infrastructure/repositories/tutor-repository";
import { SupabaseCourseMaterialRepository } from "@/infrastructure/repositories/course-material-repository";
import { SupabaseClassroomRepository } from "@/infrastructure/repositories/classroom-repository";
import { SupabaseMessageRepository } from "@/infrastructure/repositories/message-repository";
import { SupabaseNoteRepository } from "@/infrastructure/repositories/note-repository";
import { SupabaseSimulationRepository } from "@/infrastructure/repositories/simulation-repository";
import { SupabaseModerationRepository } from "@/infrastructure/repositories/moderation-repository";
import { SupabaseHelpRepository } from "@/infrastructure/repositories/help-repository";
import { SupabasePlatformConfigRepository } from "@/infrastructure/repositories/platform-config-repository";
import { SupabaseAiKeyRepository } from "@/infrastructure/repositories/ai-key-repository";
import { SupabaseAdminRepository } from "@/infrastructure/repositories/admin-repository";
import { SupabaseEmailSuppressionRepository } from "@/infrastructure/repositories/email-suppression-repository";

/**
 * Composition root — builds the request-scoped AppDependencies for an
 * authenticated caller. The Application layer only ever sees the interfaces
 * declared in `@/application/contracts/dependencies`.
 */
export function buildAppDependencies(
  supabase: SupabaseClient<Database>,
  _userId: string,
): AppDependencies {
  return {
    user: new SupabaseUserRepository(supabase),
    session: new SupabaseSessionRepository(supabase),
    tutor: new SupabaseTutorRepository(supabase),
    courseMaterial: new SupabaseCourseMaterialRepository(supabase),
    classroom: new SupabaseClassroomRepository(supabase),
    message: new SupabaseMessageRepository(supabase),
    note: new SupabaseNoteRepository(supabase),
    simulation: new SupabaseSimulationRepository(supabase),
    moderation: new SupabaseModerationRepository(supabase),
    help: new SupabaseHelpRepository(),
    platformConfig: new SupabasePlatformConfigRepository(supabase),
    aiKey: new SupabaseAiKeyRepository(),
    admin: new SupabaseAdminRepository(supabase),
    emailSuppression: new SupabaseEmailSuppressionRepository(),
    aiGateway,
    emailService,
    paymentGateway,
    entitlement: supabaseEntitlementGateway(supabase),
  };
}

/**
 * Builds the dependency set available to a PUBLIC (unauthenticated) endpoint.
 * Only public-safe capabilities are provided; every other capability fails
 * closed (throws) rather than silently leaking an auth-scoped client.
 */
export function buildPublicDependencies(): AppDependencies {
  const provided: Partial<AppDependencies> = {
    help: new SupabaseHelpRepository(),
    emailService,
    paymentGateway,
    emailSuppression: new SupabaseEmailSuppressionRepository(),
  };
  return new Proxy(provided, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop as keyof AppDependencies, receiver);
      if (value !== undefined) return value;
      throw new Error(
        `AppDependencies.${String(prop)} is unavailable in the public (unauthenticated) context`,
      );
    },
  }) as unknown as AppDependencies;
}