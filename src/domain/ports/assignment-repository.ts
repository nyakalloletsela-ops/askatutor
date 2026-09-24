/**
 * AssignmentRepository port — learner-owned assignment transitions.
 */
export interface AssignmentRepository {
  /** Mark the authenticated learner's assignment complete, without changing its content. */
  completeOwnAssignment(assignmentId: string): Promise<void>;
}
