/**
 * TutorRepository port — public tutor profile and availability reads,
 * plus the public tutor listing used by discovery and admin dashboards.
 */
export interface TutorProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  is_featured: boolean;
  avg_rating: number | null;
  review_count: number | null;
}

export interface TutorReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
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
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  is_featured: boolean;
  avg_rating: number | null;
  review_count: number | null;
  session_count: number | null;
}

export interface TutorRepository {
  getProfile(tutorId: string): Promise<TutorProfile | null>;
  listTutorReviews(tutorId: string, limit?: number): Promise<TutorReview[]>;
  getAvailability(tutorId: string, from: string, to: string): Promise<TutorAvailability>;
  listPublicTutors(): Promise<TutorListingRow[]>;
  // Tutor self-management
  getMyAvailability(tutorId: string): Promise<AvailabilityWindow[]>;
  addAvailabilityWindow(
    tutorId: string,
    window: Omit<AvailabilityWindow, "id">,
  ): Promise<AvailabilityWindow>;
  updateAvailabilitySettings(
    tutorId: string,
    settings: { timezone: string; buffer_minutes: number },
  ): Promise<void>;
  deleteAvailabilityWindow(windowId: string): Promise<void>;
  copyAvailabilityDay(tutorId: string, fromWeekday: number, toWeekday: number): Promise<void>;
}
