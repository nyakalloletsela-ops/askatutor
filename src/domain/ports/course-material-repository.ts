/**
 * CourseMaterialRepository port — course material reads, access-grant checks,
 * and signed URL issuance for storage-backed materials.
 */
export interface CourseMaterial {
  id: string;
  tutor_id: string;
  storage_path: string | null;
  external_url: string | null;
  kind: string;
}

export interface CourseMaterialRepository {
  getById(materialId: string): Promise<CourseMaterial | null>;
  hasAccessGrant(materialId: string, studentId: string): Promise<boolean>;
  signFileUrl(path: string, expiresInSec: number): Promise<string>;
}