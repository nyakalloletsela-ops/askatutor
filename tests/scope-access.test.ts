import { describe, expect, test } from "bun:test";
import { resolveScopeAccess } from "../src/presentation/domains/3-personalization-role-context/resolve-scope-access";
import type { FeatureScope } from "../src/lib/entitlements.functions";

function access(
  options: Partial<{
    scope: FeatureScope;
    configAvailable: boolean;
    subscriptionsEnabled: boolean;
    isAdmin: boolean;
    isTutor: boolean;
    scopes: FeatureScope[];
    scopesAvailable: boolean;
  }> = {},
) {
  return resolveScopeAccess({
    scope: "labs",
    configAvailable: true,
    subscriptionsEnabled: true,
    isAdmin: false,
    isTutor: false,
    scopes: [],
    scopesAvailable: true,
    ...options,
  });
}

describe("resolveScopeAccess", () => {
  test("fails closed if platform configuration is unavailable, even with open-mode defaults", () => {
    expect(access({ configAvailable: false, subscriptionsEnabled: false })).toBe(false);
  });

  test("allows access in verified open mode", () => {
    expect(access({ subscriptionsEnabled: false })).toBe(true);
  });

  test("denies a student without the required scope", () => {
    expect(access()).toBe(false);
  });

  test("allows a student with the required paid scope", () => {
    expect(access({ scopes: ["labs"] })).toBe(true);
  });

  test("denies an expired or missing scope result", () => {
    expect(access({ scopes: ["ai"] })).toBe(false);
  });

  test("denies a student when the scope lookup fails", () => {
    expect(access({ scopesAvailable: false, scopes: ["labs"] })).toBe(false);
  });

  test("allows admin and tutor bypass after platform config is verified", () => {
    expect(access({ isAdmin: true, scopesAvailable: false })).toBe(true);
    expect(access({ isTutor: true, scopesAvailable: false })).toBe(true);
  });
});
