// Node/Bun server entry for AskATutorLive.
//
//   NITRO_PRESET=node-server bun run build
//   bun run start           # or: node server.mjs
//
// The Nitro node-server build already emits a listening server, so this
// wrapper simply boots it and lets PORT/HOST control the binding.
process.env.PORT ??= "3000";
process.env.HOST ??= "0.0.0.0";

await import("../dist/server/index.mjs");

console.log(`AskATutorLive listening on http://${process.env.HOST}:${process.env.PORT}`);
