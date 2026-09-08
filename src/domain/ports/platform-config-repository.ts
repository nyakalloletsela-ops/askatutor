/**
 * PlatformConfigRepository port — single-row platform configuration updates.
 */
export interface PlatformConfigRepository {
  update(patch: Record<string, unknown>): Promise<void>;
}