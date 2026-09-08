import { createServerFn } from "@tanstack/react-start";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

export const listSchedulableStudents = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    const { deps, userId } = context;

    const isScheduler = await deps.user.hasAnyRole(userId, ["tutor", "admin"]);
    if (!isScheduler) throw new Error("Only tutors can schedule students");

    const studentIds = await deps.user.listRoleUserIds("student");
    const ids = Array.from(
      new Set(studentIds.filter((id) => id !== userId)),
    );

    if (ids.length === 0) return [];

    const names = await deps.user.listProfileNames(ids);
    return ids
      .map((id) => ({ id, name: names[id] ?? "Student" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });