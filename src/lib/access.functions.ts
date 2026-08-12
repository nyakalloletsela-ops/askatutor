import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { resolveRoomMembership, type SessionParticipantRow } from "@/lib/room-access";

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { isAdmin: !!data };
  });

async function isAdminUser(userId: string, supabase: SupabaseClient<Database>): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

export const checkRoomMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ roomId: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ context, data }) => {
    const isAdmin = await isAdminUser(context.userId, context.supabase);
    const access = await resolveRoomMembership({
      roomId: data.roomId,
      userId: context.userId,
      isAdmin,
      findSessionByRoom: async (roomId) => {
        const r = await context.supabase
          .from("sessions")
          .select("tutor_id, student_id")
          .eq("room_id", roomId)
          .maybeSingle();
        return {
          data: (r.data as SessionParticipantRow | null) ?? null,
          error: r.error as { message: string } | null,
        };
      },
    });
    return { isMember: access.isMember };
  });

/**
 * Server-side classroom context. Role (tutor/admin) is NEVER derived from the
 * client or from a room-name prefix — it is resolved from the sessions row the
 * same way membership is, so a student can never self-promote to tutor.
 */
export const getClassroomContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ roomId: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ context, data }) => {
    const isAdmin = await isAdminUser(context.userId, context.supabase);
    return resolveRoomMembership({
      roomId: data.roomId,
      userId: context.userId,
      isAdmin,
      findSessionByRoom: async (roomId) => {
        const r = await context.supabase
          .from("sessions")
          .select("tutor_id, student_id")
          .eq("room_id", roomId)
          .maybeSingle();
        return {
          data: (r.data as SessionParticipantRow | null) ?? null,
          error: r.error as { message: string } | null,
        };
      },
    });
  });
