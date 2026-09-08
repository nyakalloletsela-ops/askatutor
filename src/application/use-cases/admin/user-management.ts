import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

const CreateUserSchema = z.object({
  email: z.string().trim().email().max(255),
  full_name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(72),
  role: z.enum(["student", "tutor"]),
});

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => CreateUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    const isAdmin = await context.deps.user.isAdmin(context.userId);
    if (!isAdmin) throw new Error("Forbidden");

    const created = await context.deps.user.createUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role,
    });
    return { id: created.id, email: created.email };
  });

async function assertAdmin(context: { deps: { user: { isAdmin: (id: string) => Promise<boolean> } }; userId: string }) {
  const isAdmin = await context.deps.user.isAdmin(context.userId);
  if (!isAdmin) throw new Error("Forbidden");
}

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return context.deps.user.listUsers({ page: 1, perPage: 200 });
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.user_id === context.userId) throw new Error("You cannot delete your own account");
    await context.deps.user.deleteUser(data.user_id);
    return { ok: true };
  });