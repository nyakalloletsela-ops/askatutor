/**
 * Entitlement Gateway Contract
 *
 * Application-facing interface for feature entitlement checks and
 * privileged data access.
 *
 * The Application Layer queries this to determine user access.
 * The implementation may use database queries, subscription status, etc.
 */

export type UserRole = "admin" | "tutor" | "student" | "parent";
export type AiScope = "ai" | "labs";
export type FeatureScope = "ai" | "find_tutors" | "labs";

export interface PlatformConfigShape {
  is_subscriptions_enabled: boolean;
  ai_enabled: boolean;
  whiteboard_ocr_enabled?: boolean;
}

/**
 * EntitlementGateway — provides entitlement information to the Application
 * Layer.
 *
 * Implementations:
 * - Should query user roles, platform config, and subscription status
 * - Should fail closed (deny on error)
 * - Should be unit-testable with a fake gateway
 */
export interface EntitlementGateway {
  getRoles(userId: string): Promise<{ data: UserRole[] | null; error: { message: string } | null }>;
  getConfig(): Promise<{ data: PlatformConfigShape | null; error: { message: string } | null }>;
  getScopes(userId: string): Promise<{ data: string[] | null; error: { message: string } | null }>;
  hasApprovedLegacySubscription(userId: string): Promise<{ data: boolean; error: { message: string } | null }>;
}
