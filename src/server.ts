// Cloudflare Worker entry. Thin shim — all logic lives in
// `src/lib/server/platform.ts` so other hosts (Vercel, Node, Bun) can
// reuse the same handler. See MIGRATION.md.
import { handleRequest } from "./lib/server/platform";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    return handleRequest(request, env, ctx);
  },
};
