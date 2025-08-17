import { defineConfig } from '$fresh/server.ts'
import tailwind from '$fresh/plugins/tailwind.ts'
import { colors } from '$fresh/src/dev/deps.ts'
import { promiseProps } from './util/promiseProps.ts'
import { onProduction } from './util/onProduction.ts'

const { SELF_URL, PORT } = Deno.env.toObject()

if (SELF_URL === 'https://localhost:8000') {
  console.error(
    'Your .env is out of date.\nWe no longer rely on SELF_URL for local development.\nPlease remove it from .env.local and .env',
  )
  Deno.exit(1)
}

const serveHttps = !SELF_URL
const httpsOpts: {
  key?: string
  cert?: string
} = serveHttps
  ? await promiseProps({
    key: Deno.readTextFile('./local-certs/localhost.key'),
    cert: Deno.readTextFile('./local-certs/localhost.crt'),
  })
  : {}

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

    console.log()
    console.log(
      ' 🩺 ' +
        colors.bgRgb8(colors.rgb8('Virtual Hospitals Africa ready', 255), 57),
    )

    const is_prod = onProduction()
    if (is_prod) {
      console.log(
        `     ` +
          colors.bgRgb8(colors.rgb8('(running against production)', 255), 59),
      )
      console.log()
    }

    console.log(`    ${colors.bold('URL:')} ${address}\n`)
  },
})
