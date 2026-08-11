import { defineConfig, loadEnv, type PluginOption } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

/**
 * AskATutorLive — standalone Vite config.
 *
 * No hosting-vendor coupling. The server bundle target is chosen by
 * NITRO_PRESET at build time:
 *   NITRO_PRESET=node-server     -> dist/server/index.mjs (VPS / Docker, `bun run start`)
 *   NITRO_PRESET=vercel          -> .vercel/output
 *   NITRO_PRESET=cloudflare-module (default) -> dist/ + wrangler.jsonc
 * See DEPLOYMENT.md.
 */
const NITRO_PRESET = process.env.NITRO_PRESET || "cloudflare-module";

/**
 * Stub three.js / r3f / drei in the SSR bundle. They are only used by the
 * Simulation Lab (ssr:false under _authenticated); pulling them into the SSR
 * transform OOMs the build.
 */
const stubThreeInSsr: PluginOption = {
  name: "stub-three-in-ssr",
  enforce: "pre",
  resolveId(id, _importer, opts) {
    if (!opts?.ssr) return null;
    if (id === "three" || id.startsWith("three/") || id.startsWith("@react-three/")) {
      return "\0virtual:empty-three";
    }
    return null;
  },
  load(id) {
    if (id === "\0virtual:empty-three") {
      return `const proxy = new Proxy(function () {}, {
  get: () => proxy,
  apply: () => proxy,
  construct: () => ({}),
});
export default proxy;
export { proxy as Canvas, proxy as useFrame, proxy as useThree, proxy as OrbitControls, proxy as Grid, proxy as Stats, proxy as Html, proxy as Text };`;
    }
    return null;
  },
};

export default defineConfig(async ({ command, mode }) => {
  const plugins: PluginOption[] = [
    stubThreeInSsr,
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
  ];

  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(
      nitro({
        preset: NITRO_PRESET,
        ...(NITRO_PRESET === "cloudflare-module"
          ? {
              output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" },
              cloudflare: { nodeCompat: true, deployConfig: true },
            }
          : {}),
      } as never),
    );
  }

  plugins.push(react());

  // Inline VITE_* values so they are available in both client and SSR bundles.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    define,
    server: { port: 8080, strictPort: true, host: true },
    preview: { port: 8080 },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        // parse5 v7 imports "entities/decode" — only the nested entities@6 inside parse5 has that subpath
        "entities/decode": path.resolve(
          __dirname,
          "node_modules/parse5/node_modules/entities/dist/esm/decode.js",
        ),
        "entities/escape": path.resolve(
          __dirname,
          "node_modules/parse5/node_modules/entities/dist/esm/escape.js",
        ),
        "entities/lib/decode.js": path.resolve(__dirname, "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(__dirname, "node_modules/entities/lib/encode.js"),
        entities: path.resolve(__dirname, "node_modules/entities"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
  };
});
