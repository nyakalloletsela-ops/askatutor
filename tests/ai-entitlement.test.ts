import { describe, expect, test } from "bun:test";
import { assertAiEntitlement, premiumMessage } from "../src/application/services/entitlement-guard";
import type { EntitlementGateway, UserRole } from "../src/application/contracts/entitlements";

type Handler = (...args: unknown[]) => Promise<{ data: unknown; error: { message: string } | null }>;

function makeGateway(overrides: {
  roles?: UserRole[];
  config?: { is_subscriptions_enabled: boolean; ai_enabled: boolean; whiteboard_ocr_enabled?: boolean };
  configError?: { message: string } | null;
  scopes?: string[];
  scopesError?: { message: string } | null;
  legacyApproved?: boolean;
  rolesError?: { message: string } | null;
} = {}): EntitlementGateway & { calls: string[] } {
  const calls: string[] = [];
  const gw: EntitlementGateway & { calls: string[] } = {
    calls,
    async getRoles() {
      calls.push("getRoles");
      if (overrides.rolesError) return { data: null, error: overrides.rolesError };
      return { data: overrides.roles ?? ["student"], error: null };
    },
    async getConfig() {
      calls.push("getConfig");
      if (overrides.configError) return { data: null, error: overrides.configError };
      return {
        data: overrides.config ?? { is_subscriptions_enabled: true, ai_enabled: true },
        error: null,
      };
    },
    async getScopes() {
      calls.push("getScopes");
      if (overrides.scopesError) return { data: null, error: overrides.scopesError };
      return { data: overrides.scopes ?? [], error: null };
    },
    async hasApprovedLegacySubscription() {
      calls.push("legacy");
      return { data: overrides.legacyApproved ?? false, error: null };
    },
  };
  return gw;
}

const UID = "00000000-0000-4000-8000-000000000001";

describe("assertAiEntitlement", () => {
  test("admin bypasses every gate", async () => {
    const gw = makeGateway({ roles: ["admin"], scopes: [] });
    await expect(assertAiEntitlement(gw, UID, "ai")).resolves.toBeUndefined();
    expect(gw.calls).not.toContain("getScopes");
  });

  test("tutor bypasses every gate", async () => {
    const gw = makeGateway({ roles: ["tutor"] });
    await expect(assertAiEntitlement(gw, UID, "ai")).resolves.toBeUndefined();
  });

  test("denies when AI is disabled platform-wide (fail closed)", async () => {
    const gw = makeGateway({ config: { is_subscriptions_enabled: true, ai_enabled: false } });
    await expect(assertAiEntitlement(gw, UID, "ai")).rejects.toThrow(
      "AI features are currently disabled",
    );
  });

  test("denies when platform config cannot be read (fail closed)", async () => {
    const gw = makeGateway({ configError: { message: "boom" } });
    await expect(assertAiEntitlement(gw, UID, "ai")).rejects.toThrow(
      "Unable to verify feature access",
    );
  });

  test("allows everyone when subscriptions are disabled platform-wide", async () => {
    const gw = makeGateway({
      config: { is_subscriptions_enabled: false, ai_enabled: true },
      scopes: [],
    });
    await expect(assertAiEntitlement(gw, UID, "ai")).resolves.toBeUndefined();
    expect(gw.calls).not.toContain("getScopes");
  });

  test("allows a student holding the required scope", async () => {
    const gw = makeGateway({ scopes: ["ai", "find_tutors"] });
    await expect(assertAiEntitlement(gw, UID, "ai")).resolves.toBeUndefined();
  });

  test("denies a student without the scope", async () => {
    const gw = makeGateway({ scopes: ["find_tutors"] });
    await expect(assertAiEntitlement(gw, UID, "ai")).rejects.toThrow(premiumMessage("ai"));
  });

  test("allows a student with a legacy approved subscription for 'ai' scope", async () => {
    const gw = makeGateway({ scopes: [], legacyApproved: true });
    await expect(assertAiEntitlement(gw, UID, "ai")).resolves.toBeUndefined();
  });

  test("legacy subscription does NOT grant 'labs' scope", async () => {
    const gw = makeGateway({ scopes: [], legacyApproved: true });
    await expect(assertAiEntitlement(gw, UID, "labs")).rejects.toThrow(premiumMessage("labs"));
  });

  test("denies when scope lookup fails (fail closed)", async () => {
    const gw = makeGateway({ scopesError: { message: "rpc down" } });
    await expect(assertAiEntitlement(gw, UID, "ai")).rejects.toThrow("rpc down");
  });

  test("denies OCR when whiteboard_ocr_enabled is false", async () => {
    const gw = makeGateway({
      scopes: ["ai"],
      config: { is_subscriptions_enabled: true, ai_enabled: true, whiteboard_ocr_enabled: false },
    });
    await expect(assertAiEntitlement(gw, UID, "ai", { requireOcrEnabled: true })).rejects.toThrow(
      "Whiteboard OCR is disabled",
    );
  });

  test("allows OCR when whiteboard_ocr_enabled is true and scope held", async () => {
    const gw = makeGateway({
      scopes: ["ai"],
      config: { is_subscriptions_enabled: true, ai_enabled: true, whiteboard_ocr_enabled: true },
    });
    await expect(assertAiEntitlement(gw, UID, "ai", { requireOcrEnabled: true })).resolves.toBeUndefined();
  });
});
