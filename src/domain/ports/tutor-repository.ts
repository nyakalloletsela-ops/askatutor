/**
 * TutorRepository port — public tutor profile and availability reads,
 * plus the public tutor listing used by discovery and admin dashboards.
 */
export interface TutorProfile {
  full_name: string | null;
  hourly_rate: number | null;
  subjects: string[] | null;
}

export interface AvailabilityWindow {
  weekday: number;
  start_min: number;
  end_min: number;
  timezone: string;
  buffer_minutes: number;
}

export interface Holiday {
  start_date: string;
  end_date: string;
}

export interface BusySlot {
  scheduled_at: string;
  duration_min: number;
}

export interface TutorAvailability {
  availability: AvailabilityWindow[];
  holidays: Holiday[];
  busySlots: BusySlot[];
}

export interface TutorListingRow {
  id: string;
  full_name: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
}

export interface TutorRepository {
  getProfile(tutorId: string): Promise<TutorProfile | null>;
  getAvailability(tutorId: string, from: string, to: string): Promise<TutorAvailability>;
  listPublicTutors(): Promise<Array<Record<string, unknown>>>;
}