/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { ServerContext, start } from "$fresh/server.ts";
import { serveTls } from "std/http/server.ts";
import manifest from "./fresh.gen.ts";
import * as path from "std/path/mod.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

const port = parseInt(Deno.env.get("PORT") || "8000", 10);
// There is a spical character at Index 0.
const filePathUrl = new URL(".", import.meta.url).pathname;
const __dirname = filePathUrl.substring(1);
const certFile = path.join(__dirname, "local-certs", "localhost.crt");
const keyFile = path.join(__dirname, "local-certs", "localhost.key");

const opts = { port, plugins: [twindPlugin(twindConfig)] };
const self = Deno.env.get("SELF_URL");

if (self === "https://localhost:8000") {
  const ctx = await ServerContext.fromManifest(manifest, opts);
  await serveTls(ctx.handler(), {
    ...opts,
    certFile,
    keyFile,
  });
} else {
  await start(manifest, opts);
}
