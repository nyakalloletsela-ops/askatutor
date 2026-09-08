import type { UserDataClient } from "./helpers";
import type { CourseMaterial, CourseMaterialRepository } from "@/domain/ports/course-material-repository";

/**
 * Supabase-backed CourseMaterialRepository. Access checks run through the RLS
 * client; signed URLs require the service-role client because the storage
 * bucket is not world-readable.
 */
export class SupabaseCourseMaterialRepository implements CourseMaterialRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async getById(materialId: string): Promise<CourseMaterial | null> {
    const { data, error } = await this.supabase
      .from("course_materials")
      .select("id, tutor_id, storage_path, external_url, kind")
      .eq("id", materialId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as unknown as CourseMaterial | null) ?? null;
  }

  async hasAccessGrant(materialId: string, studentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("course_material_access")
      .select("id")
      .eq("material_id", materialId)
      .eq("student_id", studentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async signFileUrl(path: string, expiresInSec: number): Promise<string> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("course-materials")
      .createSignedUrl(path, expiresInSec);
    if (error || !signed) throw new Error(error?.message ?? "Could not sign URL");
    return signed.signedUrl;
  }
}