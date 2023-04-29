/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { ServerContext, start } from "$fresh/server.ts";
import { serveTls } from "std/http/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

const port = parseInt(Deno.env.get("PORT") || "8000", 10);

const opts = { port, plugins: [twindPlugin(twindConfig)] };

console.log("ENV", Deno.env.toObject());

if (Deno.env.get("SELF_URL") === "https://localhost:8000") {
  const ctx = await ServerContext.fromManifest(manifest, opts);
  await serveTls(ctx.handler(), {
    ...opts,
    certFile: "./local-certs/localhost.crt",
    keyFile: "./local-certs/localhost.key",
  });
} else {
  await start(manifest, opts);
}
