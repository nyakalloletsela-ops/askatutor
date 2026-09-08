import type { UserDataClient } from "./helpers";
import type {
  AvailabilityWindow,
  BusySlot,
  Holiday,
  TutorAvailability,
  TutorProfile,
  TutorRepository,
} from "@/domain/ports/tutor-repository";

/**
 * Supabase-backed TutorRepository for public profile/availability reads.
 */
export class SupabaseTutorRepository implements TutorRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async getProfile(tutorId: string): Promise<TutorProfile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("full_name, hourly_rate, subjects")
      .eq("id", tutorId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as unknown as TutorProfile | null) ?? null;
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

  async listPublicTutors(): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await this.supabase.rpc("list_public_tutors");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Array<Record<string, unknown>>;
  }
}