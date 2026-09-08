/**
 * EmailSuppressionRepository port — one-click unsubscribe token validation
 * and consumption, plus email suppression (RFC 8058). Written with a
 * privileged client because these endpoints are unauthenticated.
 */
export interface UnsubscribeTokenStatus {
  valid: boolean;
  reason?: "already_unsubscribed" | "invalid" | "expired";
}

export interface UnsubscribeResult {
  success: boolean;
  reason?: "already_unsubscribed" | "invalid" | "not_found" | "failed";
}

export interface EmailSuppressionRepository {
  checkUnsubscribeToken(token: string): Promise<UnsubscribeTokenStatus>;
  consumeUnsubscribeToken(token: string): Promise<UnsubscribeResult>;
}