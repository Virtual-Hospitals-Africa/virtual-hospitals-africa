/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { ServerContext, start } from '$fresh/server.ts'
import { serveTls } from 'std/http/server.ts'
import manifest from './fresh.gen.ts'

import twindPlugin from '$fresh/plugins/twind.ts'
import twindConfig from './twind.config.ts'

const port = parseInt(Deno.env.get('PORT') || '8000', 10)
const opts = { port, plugins: [twindPlugin(twindConfig)] }
const self = Deno.env.get('SELF_URL')

const servePlainHttp = self !== 'https://localhost:8000' ||
  Deno.env.get('SERVE_HTTP')

if (servePlainHttp) {
  await start(manifest, opts)
} else {
  const ctx = await ServerContext.fromManifest(manifest, opts)
  // deno-lint-ignore no-explicit-any
  await serveTls(ctx.handler() as any, {
    ...opts,
    certFile: './local-certs/localhost.crt',
    keyFile: './local-certs/localhost.key',
  })
}
