import { defineConfig } from '$fresh/server.ts'
import tailwind from '$fresh/plugins/tailwind.ts'
import { colors } from '$fresh/src/dev/deps.ts'

const { SELF_URL, PORT } = Deno.env.toObject()

const httpsOpts: Partial<Deno.ServeTlsOptions> = {}

if (SELF_URL === 'https://localhost:8000') {
  console.error(
    'Your .env is out of date.\nWe no longer rely on SELF_URL for local development.\nPlease remove it from .env.local and .env',
  )
  Deno.exit(1)
}

const serveHttps = !SELF_URL
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
