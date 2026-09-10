import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Provider-administration security boundary regression tests (static).
 *
 * The DB-level enforcement (revoked authenticated SELECT, admin-only RLS,
 * admin-guarded SECURITY DEFINER read RPC) is verified against the committed
 * SQL migrations; the browser/read path is verified against the committed
 * source. This guards the PAYMENT_SECURITY_AUDIT immediate-slice contract:
 *   1. browser cannot read payment_providers.config (no table SELECT grant,
 *      no select("*"), RPC never projects config);
 *   2. only the admin read RPC exposes providers to the browser, safe fields;
 *   3. provider mutations remain admin-only (RLS WITH CHECK preserved);
 *   4. server/service-role provider reads are untouched.
 */

const repoRoot = join(import.meta.dir, "..");
const migrationsDir = join(repoRoot, "supabase", "migrations");

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function readMigration(name: string): string {
  return readFileSync(join(migrationsDir, name), "utf8");
}

const BOUNDARY_MIGRATION = "20260910120000_harden_payment_provider_admin_boundary.sql";
const ORIGINAL_PROVIDERS_MIGRATION = "20260623082025_9963a138-6dc4-4d83-8b63-3cd31e3a7504.sql";

function rpcBody(sql: string, fn: string, terminator: string): string {
  const start = sql.indexOf(`FUNCTION public.${fn}`);
  if (start === -1) return "";
  const end = sql.indexOf(terminator, start);
  return end === -1 ? "" : sql.slice(start, end + terminator.length);
}

describe("payment provider admin boundary — migration SQL", () => {
  const sql = readMigration(BOUNDARY_MIGRATION);

  test("browser (authenticated) table-wide SELECT is revoked", () => {
    expect(sql).toContain("REVOKE SELECT ON public.payment_providers FROM authenticated;");
  });

  test("authenticated SELECT / ALL grant is not re-introduced", () => {
    expect(sql).not.toMatch(/GRANT (?:SELECT|ALL) ON public\.payment_providers TO authenticated/i);
  });

  test("admin mutations keep the INSERT/UPDATE grants the Admin tab needs", () => {
    expect(sql).toContain("GRANT INSERT ON public.payment_providers TO authenticated;");
    expect(sql).toContain("GRANT UPDATE ON public.payment_providers TO authenticated;");
  });

  test("read RPC is SECURITY DEFINER with a NULL-safe admin-only guard", () => {
    const body = rpcBody(sql, "admin_list_payment_providers", "$$;");
    expect(body).toContain("SECURITY DEFINER");
    expect(body).toContain("SET search_path = public");
    expect(body).toContain("auth.uid() IS NULL");
    expect(body).toContain("NOT public.has_role(auth.uid(), 'admin')");
    expect(body).toContain("RAISE EXCEPTION 'Not authorized'");
  });

  test("read RPC returns only safe operational fields, never the config column", () => {
    const body = rpcBody(sql, "admin_list_payment_providers", "$$;");
    expect(body).not.toContain("config");
    for (const safe of ["p.id", "p.credentials_ref", "p.mode", "p.last_error", "p.updated_at"]) {
      expect(body).toContain(safe);
    }
  });

  test("read RPC is not PUBLIC-callable; EXECUTE granted to authenticated only", () => {
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.admin_list_payment_providers() FROM PUBLIC;",
    );
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.admin_list_payment_providers() TO authenticated;",
    );
  });

  test("RLS is not weakened — admin write policy remains intact, none dropped", () => {
    expect(sql).not.toMatch(/DROP POLICY/i);
    const original = readMigration(ORIGINAL_PROVIDERS_MIGRATION);
    expect(original).toContain('CREATE POLICY "providers admin write" ON public.payment_providers');
    expect(original).toContain("WITH CHECK (public.has_role(auth.uid(), 'admin'))");
  });
});

describe("payment provider admin boundary — browser read path", () => {
  const page = readRepo("src/routes/_authenticated/admin.payouts.tsx");

  test("admin providers tab reads via the safe RPC, not a table select", () => {
    expect(page).toContain('supabase.rpc("admin_list_payment_providers")');
    expect(page).not.toContain('.from("payment_providers").select');
  });

  test("admin providers page keeps the client-side admin gate", () => {
    expect(page).toContain("checkIsAdmin");
    expect(page).toContain('redirect({ to: "/dashboard" })');
  });
});

describe("payment provider admin boundary — generated RPC typing", () => {
  const types = readRepo("src/integrations/supabase/types.ts");

  test("RPC return shape is typed and excludes the config column", () => {
    const start = types.indexOf("admin_list_payment_providers: {");
    expect(start).not.toBe(-1);
    const end = types.indexOf("}[]", start);
    expect(end).not.toBe(-1);
    const shape = types.slice(start, end);
    expect(shape).toContain("credentials_ref: string | null");
    expect(shape).toContain("last_error: string | null");
    expect(shape).toContain("supported_regions: Json");
    expect(shape).not.toContain("config");
  });
});

describe("payment provider admin boundary — server-side reads stay service-role", () => {
  test("payment router reads providers through the service-role client, not the browser client", () => {
    const router = readRepo("src/lib/payments/router.server.ts");
    expect(router).toContain("@/integrations/supabase/client.server");
    expect(router).toContain('.from("payment_providers")');
    expect(router).not.toContain("@/integrations/supabase/client\"");
  });

  test("gateway adapter reads provider config through the service-role client, not the browser client", () => {
    const adapter = readRepo("src/infrastructure/adapters/payment-gateway-adapter.ts");
    expect(adapter).toContain("@/integrations/supabase/client.server");
    expect(adapter).toContain('.from("payment_providers")');
    expect(adapter).not.toContain("@/integrations/supabase/client\"");
  });
});