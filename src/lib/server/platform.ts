/**
 * Server Platform Adapter
 * -----------------------
 * The current SSR entry (`src/server.ts`) targets Cloudflare Workers via
 * `@tanstack/react-start/server-entry`. This file exposes the request
 * handler in a host-neutral shape so the entry for a different platform
 * (Vercel, Node, Bun, Deno Deploy) is a thin wrapper, not a rewrite.
 *
 * Off-platform migration recipe:
 *   1. Keep this file as the canonical request handler.
 *   2. Add a host-specific entry that calls `handleRequest(request)`.
 *      Examples:
 *
 *      // Vercel Edge: src/app/[[...all]]/route.ts
 *      import { handleRequest } from "@/lib/server/platform";
 *      export const runtime = "edge";
 *      export const GET    = (req: Request) => handleRequest(req);
 *      export const POST   = (req: Request) => handleRequest(req);
 *      export const PUT    = (req: Request) => handleRequest(req);
 *      export const DELETE = (req: Request) => handleRequest(req);
 *      export const PATCH  = (req: Request) => handleRequest(req);
 *
 *      // Node: server.mjs
 *      import { createServer } from "node:http";
 *      import { handleRequest } from "./dist/server/platform.js";
 *      // ... convert IncomingMessage -> Request, await handleRequest, pipe back
 *
 *   3. Remove `wrangler.jsonc` and the `src/server.ts` Worker `export
 *      default { fetch }` wrapper — they're Cloudflare-specific.
 *
 * See MIGRATION.md.
 */

import "@/lib/error-capture";
import { consumeLastCapturedError } from "@/lib/error-capture";
import { renderErrorPage } from "@/lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env?: unknown, ctx?: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") return false;
  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((k) => expectedKeys.has(k))) return false;
  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

/**
 * Host-neutral request handler. Pass any standard Fetch `Request`.
 * Works on Cloudflare Workers, Vercel Edge, Bun, Deno, and Node (with
 * the standard Request/Response polyfill).
 */
export async function handleRequest(
  request: Request,
  env?: unknown,
  ctx?: unknown,
): Promise<Response> {
  try {
    const handler = await getServerEntry();
    const response = await handler.fetch(request, env, ctx);
    return await normalizeCatastrophicSsrResponse(response);
  } catch (error) {
    console.error(error);
    return brandedErrorResponse();
  }
}
