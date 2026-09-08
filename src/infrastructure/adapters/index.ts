import { createAiGateway } from "./ai-gateway-adapter";
import { createEmailService } from "./email-service-adapter";
import { createPaymentGateway } from "./payment-gateway-adapter";

/**
 * Infrastructure Provider Registry
 *
 * Central access point for all infrastructure adapter singletons.
 * Use cases import adapters through this registry rather than
 * importing infrastructure modules directly.
 *
 * Dependency direction:
 *   Application → contracts (interfaces)
 *   Application → adapters/index (runtime implementations)
 *   adapters/index → individual adapter modules → lib/ infrastructure
 */
export const aiGateway = createAiGateway();
export const emailService = createEmailService();
export const paymentGateway = createPaymentGateway();

export { createAiGateway } from "./ai-gateway-adapter";
export { createEmailService } from "./email-service-adapter";
export { createPaymentGateway } from "./payment-gateway-adapter";
export { supabaseEntitlementGateway } from "./supabase-entitlement-gateway";
