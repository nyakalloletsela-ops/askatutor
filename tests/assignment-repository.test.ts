import { describe, expect, test } from "bun:test";
import { SupabaseAssignmentRepository } from "../src/infrastructure/repositories/assignment-repository";
import type { UserDataClient } from "../src/infrastructure/repositories/helpers";

const ASSIGNMENT_ID = "00000000-0000-4000-8000-000000000001";

function setup(error: { message: string } | null = null) {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  const client = {
    async rpc(name: string, args: Record<string, unknown>) {
      calls.push({ name, args });
      return { error };
    },
  } as unknown as UserDataClient;
  return { repository: new SupabaseAssignmentRepository(client), calls };
}

describe("SupabaseAssignmentRepository", () => {
  test("calls the learner-scoped completion RPC with the assignment id", async () => {
    const { repository, calls } = setup();
    await repository.completeOwnAssignment(ASSIGNMENT_ID);
    expect(calls).toEqual([
      { name: "complete_own_assignment", args: { _assignment_id: ASSIGNMENT_ID } },
    ]);
  });

  test("propagates completion authorization and database errors", async () => {
    const { repository } = setup({ message: "Assignment not found or unavailable" });
    await expect(repository.completeOwnAssignment(ASSIGNMENT_ID)).rejects.toThrow(
      "Assignment not found or unavailable",
    );
  });
});
