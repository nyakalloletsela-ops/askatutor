/**
 * SessionRepository port — session lifecycle (booking, waitlist, cancel,
 * reschedule, complete) plus lesson list / room access / admin read views.
 */
export interface LessonRow {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string | null;
  scheduled_at: string;
  duration_min: number;
  room_id: string;
  status: string;
  cancel_reason: string | null;
}

export interface LessonsListResult {
  sessions: LessonRow[];
  names: Record<string, string>;
}

export interface BookingInput {
  tutorId: string;
  start: string;
  durationMin: number;
  subject: string;
  isFree: boolean;
  recurrenceWeeks: number;
}

export interface WaitlistInput {
  studentId: string;
  tutorId: string;
  subject: string | null;
  durationMin: number;
}

export interface SessionAccessRow {
  tutor_id: string;
  student_id: string;
}

export interface SessionBrief {
  id: string;
  status: string;
  scheduled_at: string;
}

export interface SessionNotificationView {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string | null;
  scheduled_at: string;
  duration_min: number;
}

export interface SessionRepository {
  book(input: BookingInput): Promise<string[]>;
  joinWaitlist(input: WaitlistInput): Promise<void>;
  cancel(sessionId: string, reason?: string): Promise<void>;
  reschedule(sessionId: string, newStartIso: string): Promise<void>;
  complete(sessionId: string): Promise<void>;
  listLessons(): Promise<LessonsListResult>;
  getRoomAccess(roomId: string): Promise<SessionAccessRow | null>;
  getNotificationView(sessionId: string): Promise<SessionNotificationView | null>;
  listRecent(fromIso: string): Promise<SessionBrief[]>;
  countAll(): Promise<number>;
}