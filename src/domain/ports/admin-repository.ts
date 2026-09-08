/**
 * AdminRepository port — the admin home dashboard aggregate read plus tutor
 * application decision RPCs.
 */
import type { JsonValue } from "@/domain/ports/json";

export interface TutorApplicationRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  subjects: JsonValue;
  bio: string;
  status: string;
  submitted_at: string;
  [key: string]: JsonValue;
}

export interface AuditLogRow {
  id: string;
  actor_id: string;
  action: string;
  notes: string;
  created_at: string;
  [key: string]: JsonValue;
}

export interface DashboardData {
  applications: TutorApplicationRow[];
  tutors: Array<Record<string, JsonValue>>;
  sessions: Array<{ id: string; status: string; scheduled_at: string }>;
  auditLog: AuditLogRow[];
  actorNames: Record<string, string>;
  counts: { students: number; tutors: number; sessions: number };
}

export interface AdminRepository {
  getDashboardData(): Promise<DashboardData>;
  approveTutorApplication(applicationId: string, notes?: string): Promise<void>;
  rejectTutorApplication(applicationId: string, notes?: string): Promise<void>;
  logTutorDecision(applicationIds: string[], action: string, notes?: string): Promise<void>;
}
