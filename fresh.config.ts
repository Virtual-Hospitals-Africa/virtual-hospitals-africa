import 'dotenv'
import { assert } from 'std/assert/assert.ts'
import { defineConfig } from '$fresh/server.ts'
import tailwind from '$fresh/plugins/tailwind.ts'

const { SELF_URL, SERVE_HTTP, PORT } = Deno.env.toObject()

assert(SELF_URL, 'SELF_URL must be set')

const httpsOpts: Partial<Deno.ServeTlsOptions> = {}
const serveHttps = SELF_URL === 'https://localhost:8000' && !SERVE_HTTP
if (serveHttps) {
  const readingKey = Deno.readTextFile('./local-certs/localhost.key')
  const readingCert = Deno.readTextFile('./local-certs/localhost.crt')
  httpsOpts.key = await readingKey
  httpsOpts.cert = await readingCert
}

export default defineConfig({
  plugins: [tailwind()],
  server: {
    port: PORT ? parseInt(PORT, 10) : 8000,
    ...httpsOpts,
  },
})
