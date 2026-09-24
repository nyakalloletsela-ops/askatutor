import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserDataClient } from "./helpers";
import type {
  AvailabilityWindow,
  BusySlot,
  Holiday,
  TutorAvailability,
  TutorListingRow,
  TutorProfile,
  TutorRepository,
  TutorReview,
} from "@/domain/ports/tutor-repository";

/**
 * Supabase-backed TutorRepository for public profile/availability reads.
 */
export class SupabaseTutorRepository implements TutorRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async getProfile(tutorId: string): Promise<TutorProfile | null> {
    const rows = await this.listPublicTutors();
    const row = rows.find((t) => t.id === tutorId);
    if (!row) return null;

    return {
      id: row.id,
      full_name: row.full_name,
      bio: row.bio,
      subjects: row.subjects,
      hourly_rate: row.hourly_rate,
      avatar_url: row.avatar_url,
      is_featured: row.is_featured,
      avg_rating: row.avg_rating,
      review_count: row.review_count,
    };
  }

  async listTutorReviews(tutorId: string, limit = 20): Promise<TutorReview[]> {
    const supabase = this.supabase as unknown as SupabaseClient;
    const { data, error } = await supabase
      .from("tutor_reviews_public")
      .select("id, rating, comment, created_at")
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as TutorReview[];
  }

  async getAvailability(tutorId: string, from: string, to: string): Promise<TutorAvailability> {
    const [availRes, holidaysRes, busyRes] = await Promise.all([
      this.supabase.rpc("get_tutor_availability_public", { _tutor: tutorId }),
      this.supabase.rpc("get_tutor_holidays_public", { _tutor: tutorId }),
      this.supabase.rpc("get_tutor_busy_slots", {
        _tutor: tutorId,
        _from: from,
        _to: to,
      }),
    ]);

    return {
      availability: (availRes.data ?? []) as unknown as AvailabilityWindow[],
      holidays: (holidaysRes.data ?? []) as unknown as Holiday[],
      busySlots: (busyRes.data ?? []) as unknown as BusySlot[],
    };
  }

  async listPublicTutors(): Promise<TutorListingRow[]> {
    const { data, error } = await this.supabase.rpc("list_public_tutors");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as TutorListingRow[];
  }

  // Tutor self-management methods
  async getMyAvailability(tutorId: string): Promise<AvailabilityWindow[]> {
    const { data, error } = await this.supabase
      .from("tutor_availability")
      .select("id, weekday, start_min, end_min, timezone, buffer_minutes")
      .eq("tutor_id", tutorId)
      .order("weekday")
      .order("start_min");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AvailabilityWindow[];
  }

  async addAvailabilityWindow(
    tutorId: string,
    window: Omit<AvailabilityWindow, "id">,
  ): Promise<AvailabilityWindow> {
    const { data, error } = await this.supabase
      .from("tutor_availability")
      .insert({
        tutor_id: tutorId,
        weekday: window.weekday,
        start_min: window.start_min,
        end_min: window.end_min,
        timezone: window.timezone,
        buffer_minutes: window.buffer_minutes,
      })
      .select("id, weekday, start_min, end_min, timezone, buffer_minutes")
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as AvailabilityWindow;
  }

  async updateAvailabilitySettings(
    tutorId: string,
    settings: { timezone: string; buffer_minutes: number },
  ): Promise<void> {
    const { error } = await this.supabase
      .from("tutor_availability")
      .update({ timezone: settings.timezone, buffer_minutes: settings.buffer_minutes })
      .eq("tutor_id", tutorId);
    if (error) throw new Error(error.message);
  }

  async deleteAvailabilityWindow(windowId: string): Promise<void> {
    const { error } = await this.supabase.from("tutor_availability").delete().eq("id", windowId);
    if (error) throw new Error(error.message);
  }

  async copyAvailabilityDay(
    tutorId: string,
    fromWeekday: number,
    toWeekday: number,
  ): Promise<void> {
    const { data: rows } = await this.supabase
      .from("tutor_availability")
      .select("weekday, start_min, end_min, timezone, buffer_minutes")
      .eq("tutor_id", tutorId)
      .eq("weekday", fromWeekday);

    if (!rows || rows.length === 0) {
      throw new Error("Nothing to copy");
    }

    await this.supabase
      .from("tutor_availability")
      .delete()
      .eq("tutor_id", tutorId)
      .eq("weekday", toWeekday);

    const inserts = rows.map((r) => ({
      tutor_id: tutorId,
      weekday: toWeekday,
      start_min: r.start_min,
      end_min: r.end_min,
      timezone: r.timezone,
      buffer_minutes: r.buffer_minutes,
    }));

    const { error } = await this.supabase.from("tutor_availability").insert(inserts);
    if (error) throw new Error(error.message);
  }
}
