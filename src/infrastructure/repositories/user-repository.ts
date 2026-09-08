import type { UserDataClient } from "./helpers";
import type {
  CreateUserInput,
  ManagedUser,
  RoleName,
  UserRepository,
} from "@/domain/ports/user-repository";

/**
 * Supabase-backed UserRepository.
 * Own-role reads use the RLS-scoped caller client; privileged reads and Auth
 * Admin operations lazily acquire the service-role client (Infrastructure is
 * the only layer permitted to touch it).
 */
export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async hasAnyRole(userId: string, roles: RoleName[]): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", roles);
    if (error) throw new Error(error.message);
    return (data?.length ?? 0) > 0;
  }

  async listRoles(userId: string): Promise<RoleName[]> {
    const { data, error } = await this.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.role as RoleName);
  }

  async countRole(role: RoleName): Promise<number> {
    const { count, error } = await this.supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", role);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async listRoleUserIds(role: RoleName): Promise<string[]> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", role);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.user_id);
  }

  async getProfileName(userId: string): Promise<string | null> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.full_name ?? null;
  }

  async listProfileNames(ids: string[]): Promise<Record<string, string | null>> {
    if (ids.length === 0) return {};
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    if (error) throw new Error(error.message);
    const result: Record<string, string | null> = {};
    for (const p of data ?? []) result[p.id] = p.full_name ?? null;
    return result;
  }

  async getEmail(userId: string): Promise<string | null> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  }

  async createUser(input: CreateUserInput): Promise<{ id: string; email: string | null }> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name },
    });
    if (error || !data.user) throw new Error(error?.message ?? "Create failed");

    if (input.role === "tutor") {
      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.user.id, role: "tutor" });
      if (roleErr) throw new Error(roleErr.message);
    }
    return { id: data.user.id, email: data.user.email ?? null };
  }

  async listUsers(options?: { page?: number; perPage?: number }): Promise<ManagedUser[]> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: options?.page ?? 1,
      perPage: options?.perPage ?? 200,
    });
    if (error) throw new Error(error.message);

    const ids = list.users.map((u) => u.id);
    const [profilesRes, rolesRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name").in("id", ids),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids),
    ]);

    const nameById = new Map(ids.map((id) => [id, null as string | null]));
    for (const p of profilesRes.data ?? []) nameById.set(p.id, p.full_name ?? null);

    const rolesById = new Map<string, string[]>();
    for (const r of rolesRes.data ?? []) {
      const arr = rolesById.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesById.set(r.user_id, arr);
    }

    return list.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      full_name: nameById.get(u.id) ?? null,
      roles: rolesById.get(u.id) ?? [],
    }));
  }

  async deleteUser(userId: string): Promise<void> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
  }
}
