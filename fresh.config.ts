import { assert } from 'std/assert/assert.ts'
import { defineConfig } from '$fresh/server.ts'
import tailwind from '$fresh/plugins/tailwind.ts'
import { colors } from '$fresh/src/dev/deps.ts'
import range from './util/range.ts'

const { BUILDING, SELF_URL, SERVE_HTTP, PORT } = Deno.env.toObject()

if (!BUILDING) assert(SELF_URL, 'SELF_URL must be set')

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
  // TODO remove when PR into fresh merged
  // https://github.com/denoland/fresh/pull/2321
  onListen(params) {
    const protocol = serveHttps ? 'https:' : 'http:'
    const address = colors.cyan(
      `${protocol}//localhost:${params.port}`,
    )
    const localLabel = colors.bold('Local:')

    console.log()
    console.log(
      ' 🩺 ' +
        colors.bgRgb8(colors.rgb8('Virtual Hospitals Africa ready', 255), 57),
    )
    console.log(`    ${localLabel} ${address}\n`)
  },
})
