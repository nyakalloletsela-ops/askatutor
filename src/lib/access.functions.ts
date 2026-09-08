/**
 * Re-exports from the Application Layer.
 *
 * This file preserves backward compatibility for existing consumers
 * that import from @/lib/access.functions.
 *
 * All application logic now lives in:
 *   src/application/use-cases/identity/check-access.ts
 */
export { checkIsAdmin, getClassroomContext } from "@/application/use-cases/identity/check-access";
