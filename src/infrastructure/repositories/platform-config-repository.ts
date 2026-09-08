import type { UserDataClient } from "./helpers";
import type { Database } from "@/integrations/supabase/types";
import type { PlatformConfigRepository } from "@/domain/ports/platform-config-repository";

type PlatformConfigUpdate = Database["public"]["Tables"]["platform_config"]["Update"];

/**
 * Supabase-backed PlatformConfigRepository — updates the single platform
 * config row via the RLS caller client (admin policy enforced by Postgres).
 */
export class SupabasePlatformConfigRepository implements PlatformConfigRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async update(patch: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase
      .from("platform_config")
      .update(patch as unknown as PlatformConfigUpdate)
      .eq("id", 1);
    if (error) throw new Error(error.message);
  }
}