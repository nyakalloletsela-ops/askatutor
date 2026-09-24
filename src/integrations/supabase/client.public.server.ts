// Server-side Supabase client bound to the `anon` role (no user token).
// Use this for PUBLIC (unauthenticated) server functions that only hit the
// sanctioned public data surface (PUBLIC-granted RPCs / views). RLS applies
// through the `anon` role; unlike the service-role client this never bypasses
// security. For authenticated queries, use the auth middleware instead.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createPublicSupabaseClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Set them in your environment (see .env.example).`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAnon: ReturnType<typeof createPublicSupabaseClient> | undefined;

// Server-side anon-role Supabase client for public (unauthenticated) server fns.
// Import like: import { supabaseAnon } from "@/integrations/supabase/client.public.server";
export const supabaseAnon = new Proxy({} as ReturnType<typeof createPublicSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAnon) _supabaseAnon = createPublicSupabaseClient();
    return Reflect.get(_supabaseAnon, prop, receiver);
  },
});
