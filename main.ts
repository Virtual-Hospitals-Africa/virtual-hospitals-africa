/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { ServerContext, start } from '$fresh/server.ts'
import { serveTls } from '$std/http/server.ts'
import manifest from './fresh.gen.ts'
import { defineConfig } from '$fresh/server.ts'
import tailwind from '$fresh/plugins/tailwind.ts'

const port = parseInt(Deno.env.get('PORT') || '8000', 10)
const self = Deno.env.get('SELF_URL')

const servePlainHttp = self !== 'https://localhost:8000' ||
  Deno.env.get('SERVE_HTTP')

const config = defineConfig({
  port,
  plugins: [tailwind()],
})

if (servePlainHttp) {
  await start(manifest, config)
} else {
  const ctx = await ServerContext.fromManifest(manifest, config)
  // deno-lint-ignore no-explicit-any
  await serveTls(ctx.handler() as any, {
    ...config,
    certFile: './local-certs/localhost.crt',
    keyFile: './local-certs/localhost.key',
  })
}
