import { describe, expect, test } from "bun:test";
import { resolveRoomMembership, type RoomLookup } from "../src/lib/room-access";

const TUTOR = "00000000-0000-4000-8000-0000000000aa";
const STUDENT = "00000000-0000-4000-8000-0000000000bb";
const ROOM = "aat-123";

function lookup(overrides: {
  userId?: string;
  isAdmin?: boolean;
  row?: { tutor_id: string; student_id: string } | null;
  error?: { message: string } | null;
} = {}): RoomLookup {
  return {
    roomId: ROOM,
    userId: overrides.userId ?? STUDENT,
    isAdmin: overrides.isAdmin ?? false,
    findSessionByRoom: async () => ({
      data:
        overrides.row === undefined
          ? { tutor_id: TUTOR, student_id: STUDENT }
          : overrides.row,
      error: overrides.error ?? null,
    }),
  };
}

describe("resolveRoomMembership (fail-closed)", () => {
  test("denies when no session row exists for the room", async () => {
    const access = await resolveRoomMembership(lookup({ row: null }));
    expect(access).toEqual({ isMember: false, isTutor: false, isAdmin: false });
  });

  test("allows the student participant without tutor privileges", async () => {
    const access = await resolveRoomMembership(lookup({ userId: STUDENT }));
    expect(access.isMember).toBe(true);
    expect(access.isTutor).toBe(false);
  });

  test("allows the tutor participant with tutor privileges", async () => {
    const access = await resolveRoomMembership(lookup({ userId: TUTOR }));
    expect(access.isMember).toBe(true);
    expect(access.isTutor).toBe(true);
  });

  test("denies a stranger even if the room id is a guess", async () => {
    const access = await resolveRoomMembership(lookup({ userId: "deadbeef-0000-4000-8000-000000000000" }));
    expect(access.isMember).toBe(false);
  });

  test("admins may enter any real room and are treated as tutors", async () => {
    const access = await resolveRoomMembership(lookup({ userId: STUDENT, isAdmin: true }));
    expect(access.isMember).toBe(true);
    expect(access.isTutor).toBe(true);
    expect(access.isAdmin).toBe(true);
  });

  test("propagates lookup errors so callers deny access (fail closed)", async () => {
    await expect(
      resolveRoomMembership(lookup({ error: { message: "db down" } })),
    ).rejects.toThrow("db down");
  });

  test("no demo/bypass path: a 'demo-' room with no session row is denied", async () => {
    const access = await resolveRoomMembership({
      ...lookup({ row: null }),
      roomId: "demo-abc123",
    });
    expect(access.isMember).toBe(false);
  });
});
