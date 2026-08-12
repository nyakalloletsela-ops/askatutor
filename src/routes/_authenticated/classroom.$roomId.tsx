import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getClassroomContext } from "@/lib/access.functions";
import { ClassroomShell } from "@/components/classroom/ClassroomShell";

export const Route = createFileRoute("/_authenticated/classroom/$roomId")({
  beforeLoad: async ({ params }) => {
    // Fail closed: any error resolving membership denies entry.
    const ctx = await getClassroomContext({ data: { roomId: params.roomId } }).catch((e) => {
      if (e && typeof e === "object" && "to" in e) throw e;
      console.warn("[classroom] membership check failed, denying entry:", e);
      throw redirect({ to: "/dashboard" });
    });
    if (!ctx.isMember) throw redirect({ to: "/dashboard" });
  },
  component: ClassroomPage,
});

function ClassroomPage() {
  const { roomId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const [isTutor, setIsTutor] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Resolve the tutor flag server-side from the session row — never from the
    // room name or client state.
    getClassroomContext({ data: { roomId } })
      .then((ctx) => setIsTutor(ctx.isTutor))
      .catch(() => setIsTutor(false));
  }, [roomId, user]);

  if (!user) return null;
  const displayName = user.email ?? "Guest";

  return (
    <ClassroomShell
      roomId={roomId}
      userId={user.id}
      displayName={displayName}
      isTutor={isTutor}
      isAdmin={isAdmin}
    />
  );
}
