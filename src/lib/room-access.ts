export interface SessionParticipantRow {
  tutor_id: string;
  student_id: string;
}

export interface RoomLookup {
  roomId: string;
  userId: string;
  isAdmin: boolean;
  findSessionByRoom(
    roomId: string,
  ): Promise<{
    data: SessionParticipantRow | null;
    error: { message: string } | null;
  }>;
}

export interface RoomAccess {
  isMember: boolean;
  isTutor: boolean;
  isAdmin: boolean;
}

/**
 * Fail-closed classroom membership resolution. A user may enter a room only if
 * a real session exists with that room_id and the user is the tutor, the
 * student, or an admin. There is no demo/bypass path, and any lookup error
 * propagates so callers can deny access rather than allow it.
 */
export async function resolveRoomMembership(lookup: RoomLookup): Promise<RoomAccess> {
  const { data: row, error } = await lookup.findSessionByRoom(lookup.roomId);
  if (error) throw new Error(error.message);
  if (!row) return { isMember: false, isTutor: false, isAdmin: lookup.isAdmin };

  const isParticipant = row.tutor_id === lookup.userId || row.student_id === lookup.userId;
  return {
    isMember: isParticipant || lookup.isAdmin,
    isTutor: row.tutor_id === lookup.userId || lookup.isAdmin,
    isAdmin: lookup.isAdmin,
  };
}
