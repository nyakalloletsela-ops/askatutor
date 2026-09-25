import type { UserDataClient } from "./helpers";
import type { AssignmentRepository } from "@/domain/ports/assignment-repository";

/**
 * Supabase-backed assignment commands. The database RPC derives the learner
 * from auth.uid() and changes only the completion status.
 */
export class SupabaseAssignmentRepository implements AssignmentRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async completeOwnAssignment(assignmentId: string): Promise<void> {
    const { error } = await this.supabase.rpc("complete_own_assignment", {
      _assignment_id: assignmentId,
    });
    if (error) throw new Error(error.message);
  }
}
