import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260923140000_enforce_simulation_entitlement_and_atomic_save.sql",
  ),
  "utf8",
);
const ownerMigrationName = readdirSync(resolve(process.cwd(), "supabase/migrations")).find((name) =>
  name.startsWith("20260623113448_"),
);
if (!ownerMigrationName) throw new Error("Simulation owner-policy migration was not found");
const ownerMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations", ownerMigrationName),
  "utf8",
);
const versionMigrationName = readdirSync(resolve(process.cwd(), "supabase/migrations")).find(
  (name) => name.startsWith("20260623121121_"),
);
if (!versionMigrationName) throw new Error("Simulation version-policy migration was not found");
const versionMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations", versionMigrationName),
  "utf8",
);

describe("Virtual Lab simulation persistence migration contract", () => {
  test("derives ownership, checks Labs and AI access, and validates bounded state", () => {
    expect(migration).toContain("_user_id uuid := auth.uid()");
    expect(migration).toContain("pc.ai_enabled = true");
    expect(migration).toContain("public.student_has_scope('labs')");
    expect(migration).toContain("jsonb_typeof(_schema_json -> 'objects')");
    expect(migration).toContain("jsonb_array_length(_schema_json -> 'objects') > 60");
    expect(migration).toContain("jsonb_array_length(_schema_json -> 'graph2d' -> 'curves') > 6");
    expect(migration).toContain("jsonb_typeof(connection_row.value -> 'from') = 'number'");
    expect(migration).toContain("pg_column_size(_schema_json) > 1048576");
  });

  test("uses a private pinned-path definer helper behind an authenticated invoker RPC", () => {
    expect(migration).toContain("CREATE SCHEMA IF NOT EXISTS lab_private");
    expect(migration).toContain("CREATE FUNCTION lab_private.save_simulation_with_initial_version");
    expect(migration).toContain("SECURITY DEFINER\nSET search_path = ''");
    expect(migration).toContain("LANGUAGE sql\nSECURITY INVOKER\nSET search_path = ''");
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.save_simulation_with_initial_version\([\s\S]*?FROM PUBLIC, anon/,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.save_simulation_with_initial_version\([\s\S]*?TO authenticated/,
    );
  });

  test("makes initial definition and version-1 history atomic and retries idempotent", () => {
    expect(migration).toContain("simulations_owner_save_request_uidx");
    expect(migration).toContain(
      "ON CONFLICT (user_id, save_request_id) WHERE save_request_id IS NOT NULL",
    );
    expect(migration).toContain("_simulation.schema_json IS DISTINCT FROM _schema_json");
    expect(migration).toContain("INSERT INTO public.simulation_versions");
    expect(migration).toContain("VALUES (_simulation.id, _user_id, _schema_json, _prompt, 1)");
    expect(migration).toContain("REVOKE INSERT, UPDATE, DELETE ON public.simulation_versions");
    expect(migration).toContain("REVOKE UPDATE ON public.simulations");
  });

  test("retains per-owner row policies and unique version numbering", () => {
    expect(ownerMigration).toContain('CREATE POLICY "owners read own simulations"');
    expect(ownerMigration).toContain("USING (auth.uid() = user_id)");
    expect(versionMigration).toContain('CREATE POLICY "owners read own simulation versions"');
    expect(versionMigration).toContain("UNIQUE (simulation_id, version_number)");
  });

  test("preserves owner-scoped reads and makes similarity lookup invoker-secure", () => {
    expect(migration).toContain('CREATE POLICY "entitled owners insert own simulations"');
    expect(migration).toContain("LANGUAGE plpgsql STABLE SECURITY INVOKER");
    expect(migration).toContain("OPERATOR(public.<=>)");
    expect(migration).toContain(
      "ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = ''",
    );
    expect(migration).toContain("ALTER FUNCTION public.get_my_scopes() SET search_path = ''");
    expect(migration).toContain(
      "ALTER FUNCTION public.student_has_scope(text) SET search_path = ''",
    );
    expect(migration).toContain(
      "ALTER FUNCTION public.can_access_classroom_room(text) SET search_path = ''",
    );
    expect(migration).toContain("FROM PUBLIC, anon");
    expect(migration).toContain("TO authenticated");
  });

  test("limits classroom lab realtime channels to existing room participants", () => {
    expect(migration).toContain('CREATE POLICY "room members access lab topic"');
    expect(migration).toContain('CREATE POLICY "room members broadcast lab topic"');
    expect(migration).toContain(
      "public.can_access_classroom_room(substring(realtime.topic() FROM 5))",
    );
    expect(migration).toContain("ELSE false");
  });
});
