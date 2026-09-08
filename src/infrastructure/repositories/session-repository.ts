import type { UserDataClient } from "./helpers";
import type {
  BookingInput,
  LessonsListResult,
  LessonRow,
  SessionAccessRow,
  SessionBrief,
  SessionNotificationView,
  SessionRepository,
  WaitlistInput,
} from "@/domain/ports/session-repository";

/**
 * Supabase-backed SessionRepository. Uses the RLS-scoped caller client;
 * row-level policies enforce that callers may only act on their own sessions.
 */
export class SupabaseSessionRepository implements SessionRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async book(input: BookingInput): Promise<string[]> {
    const { error, data } = await this.supabase.rpc("book_session", {
      _tutor: input.tutorId,
      _start: input.start,
      _duration_min: input.durationMin,
      _subject: input.subject,
      _is_free: input.isFree,
      _recurrence_weeks: input.recurrenceWeeks,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as string[];
  }

  async joinWaitlist(input: WaitlistInput): Promise<void> {
    const { error } = await this.supabase.from("session_waitlist").insert({
      tutor_id: input.tutorId,
      student_id: input.studentId,
      subject: input.subject,
      duration_min: input.durationMin,
    });
    if (error) throw new Error(error.message);
  }

  async cancel(sessionId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase.rpc("cancel_session", {
      _session: sessionId,
      _reason: reason,
    });
    if (error) throw new Error(error.message);
  }

  async reschedule(sessionId: string, newStartIso: string): Promise<void> {
    const { error } = await this.supabase.rpc("reschedule_session", {
      _session: sessionId,
      _new_start: newStartIso,
    });
    if (error) throw new Error(error.message);
  }

  async complete(sessionId: string): Promise<void> {
    const { error } = await this.supabase.rpc("complete_session", {
      _session: sessionId,
    });
    if (error) throw new Error(error.message);
  }

  async listLessons(): Promise<LessonsListResult> {
    const { data: sessions } = await this.supabase
      .from("sessions")
      .select(
        "id, tutor_id, student_id, subject, scheduled_at, duration_min, room_id, status, cancel_reason",
      )
      .order("scheduled_at", { ascending: true });

    const list = (sessions ?? []) as unknown as LessonRow[];

    const ids = Array.from(new Set(list.flatMap((l) => [l.tutor_id, l.student_id])));
    let names: Record<string, string> = {};
    if (ids.length) {
      const { data: profiles } = await this.supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      for (const p of profiles ?? []) {
        names[p.id] = p.full_name ?? "User";
      }
    }

    return { sessions: list, names };
  }

  async getRoomAccess(roomId: string): Promise<SessionAccessRow | null> {
    const { data, error } = await this.supabase
      .from("sessions")
      .select("tutor_id, student_id")
      .eq("room_id", roomId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as unknown as SessionAccessRow | null) ?? null;
  }

  async getNotificationView(sessionId: string): Promise<SessionNotificationView | null> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select("id, tutor_id, student_id, subject, scheduled_at, duration_min")
      .eq("id", sessionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as unknown as SessionNotificationView | null) ?? null;
  }

  async listRecent(fromIso: string): Promise<SessionBrief[]> {
    const { data, error } = await this.supabase
      .from("sessions")
      .select("id, status, scheduled_at")
      .gte("scheduled_at", fromIso)
      .order("scheduled_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as SessionBrief[];
  }

  async countAll(): Promise<number> {
    const { count, error } = await this.supabase
      .from("sessions")
      .select("id", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}