import type { UserDataClient } from "./helpers";
import type { JsonValue } from "@/domain/ports/json";
import type {
  AdminRepository,
  AuditLogRow,
  DashboardData,
  TutorApplicationRow,
} from "@/domain/ports/admin-repository";

/**
 * Supabase-backed AdminRepository — aggregate admin-home dashboard read plus
 * tutor application decision RPCs. Reads run through the RLS caller client
 * (admins hold a read-all policy); the RPCs enforce admin internally.
 */
export class SupabaseAdminRepository implements AdminRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async getDashboardData(): Promise<DashboardData> {
    const { supabase } = this;

    const [applicationsRes, tutorsRes, sessionsRes, auditRes] = await Promise.all([
      supabase
        .from("tutor_applications")
        .select("id, user_id, full_name, email, subjects, bio, status, submitted_at")
        .order("submitted_at", { ascending: false })
        .limit(20),
      supabase.rpc("list_public_tutors"),
      supabase
        .from("sessions")
        .select("id, status, scheduled_at")
        .gte("scheduled_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("scheduled_at", { ascending: false })
        .limit(500),
      supabase
        .from("admin_audit_log")
        .select("id, actor_id, action, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const actorIds = Array.from(new Set((auditRes.data ?? []).map((r) => r.actor_id as string)));
    let actorNames: Record<string, string> = {};
    if (actorIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", actorIds);
      for (const p of profiles ?? []) actorNames[p.id] = p.full_name ?? "Unknown";
    }

    const [studentsCountRes, tutorsCountRes, sessionsCountRes] = await Promise.all([
      supabase
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "tutor"),
      supabase.from("sessions").select("id", { count: "exact", head: true }),
    ]);

    return {
      applications: (applicationsRes.data ?? []) as unknown as TutorApplicationRow[],
      tutors: (tutorsRes.data ?? []) as unknown as Array<Record<string, JsonValue>>,
      sessions: (sessionsRes.data ?? []) as unknown as Array<{
        id: string;
        status: string;
        scheduled_at: string;
      }>,
      auditLog: (auditRes.data ?? []) as unknown as AuditLogRow[],
      actorNames,
      counts: {
        students: studentsCountRes.count ?? 0,
        tutors: tutorsCountRes.count ?? 0,
        sessions: sessionsCountRes.count ?? 0,
      },
    };
  }

  async approveTutorApplication(applicationId: string, notes?: string): Promise<void> {
    const { error } = await this.supabase.rpc("approve_tutor_application", {
      _application_id: applicationId,
      _notes: notes,
    });
    if (error) throw new Error(error.message);
  }

  async rejectTutorApplication(applicationId: string, notes?: string): Promise<void> {
    const { error } = await this.supabase.rpc("reject_tutor_application", {
      _application_id: applicationId,
      _notes: notes,
    });
    if (error) throw new Error(error.message);
  }

  async logTutorDecision(applicationIds: string[], action: string, notes?: string): Promise<void> {
    const { error } = await this.supabase.rpc("log_tutor_decision", {
      _application_ids: applicationIds,
      _action: action,
      _notes: notes,
    });
    if (error) throw new Error(error.message);
  }
}
