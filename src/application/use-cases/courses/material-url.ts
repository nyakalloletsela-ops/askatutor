import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Returns a short-lived signed URL for a course material file.
 * Access rules: the owning tutor, an admin, or a student with an access grant.
 */
export const getCourseMaterialUrl = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z.object({ materialId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { deps, userId } = context;

    const material = await deps.courseMaterial.getById(data.materialId);
    if (!material) throw new Error("Material not found");

    if (material.kind === "link" || !material.storage_path) {
      return { url: material.external_url ?? "" };
    }

    let allowed = material.tutor_id === userId;
    if (!allowed) allowed = await deps.user.isAdmin(userId);
    if (!allowed) allowed = await deps.courseMaterial.hasAccessGrant(data.materialId, userId);
    if (!allowed) throw new Error("Not authorized");

    const url = await deps.courseMaterial.signFileUrl(material.storage_path, 60 * 10);
    return { url };
  });