import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";
import {
  resolveRoomMembership,
  type RoomAccess,
  type RoomLookup,
} from "@/application/services/room-access";

/**
 * Check Is Admin
 *
 * Returns whether the current user has the admin role.
 */
export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    const isAdmin = await context.deps.user.isAdmin(context.userId);
    return { isAdmin };
  });

/**
 * Get Classroom Context
 *
 * Server-side classroom context. Role (tutor/admin) is NEVER derived from the
 * client — it is resolved from the sessions row the same way membership is.
 */
export const getClassroomContext = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ roomId: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ context, data }): Promise<RoomAccess> => {
    const { deps, userId } = context;
    const isAdmin = await deps.user.isAdmin(userId);
    const lookup: RoomLookup = {
      roomId: data.roomId,
      userId,
      isAdmin,
      findSessionByRoom: async () => {
        try {
          const row = await deps.session.getRoomAccess(data.roomId);
          return { data: row, error: null };
        } catch (err) {
          return { data: null, error: { message: (err as Error).message } };
        }
      },
    };
    return resolveRoomMembership(lookup);
  });

/**
 * Get My Scopes
 *
 * Returns the feature scopes for the current user.
 */
export const getMyScopes = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    const { deps, userId } = context;
    const res = await deps.entitlement.getScopes(userId);
    if (res.error) throw new Error(res.error.message);
    return (res.data ?? []) as string[];
  });
