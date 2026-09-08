/**
 * Compatibility shim — room membership logic now lives in the Application
 * layer.
 *
 * Keep this shim for server fns / tests that predate the re-export; new code
 * should import from `@/application/services/room-access` or consume
 * `context.deps.session` via the `SessionRepository` contract.
 */
export { resolveRoomMembership } from "@/application/services/room-access";
export type {
  RoomAccess,
  RoomLookup,
  SessionParticipantRow,
} from "@/application/services/room-access";
