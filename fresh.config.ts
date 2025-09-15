import { defineConfig } from '$fresh/server.ts'
import tailwind from '$fresh/plugins/tailwind.ts'
import { colors } from '$fresh/src/dev/deps.ts'
import { promiseProps } from './util/promiseProps.ts'
import { onProduction } from './util/onProduction.ts'
import { opts as db_opts } from './db/db.ts'
import httpsUrlPlugin from './plugins/httpsUrl.ts'

const { SERVE_PLAIN_HTTP, PORT } = Deno.env.toObject()

const httpsOpts: {
  key?: string
  cert?: string
} = SERVE_PLAIN_HTTP ? {} : await promiseProps({
  key: Deno.readTextFile('./local-certs/localhost.key'),
  cert: Deno.readTextFile('./local-certs/localhost.crt'),
})

export default defineConfig({
  plugins: [tailwind(), httpsUrlPlugin()],
  server: {
    port: PORT ? parseInt(PORT, 10) : 8000,
    ...httpsOpts,
  },
  onListen(params) {
    const protocol = SERVE_PLAIN_HTTP ? 'http:' : 'https:'
    const address = `${protocol}//localhost:${params.port}`

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

    console.log(`    ${colors.bold('URL:')} ${colors.cyan(address)}\n`)

    if (Deno.env.get('USE_DOCKER_FOR_POSTGRES')) {
      console.log(
        ' 💽 ' +
          colors.bgRgb8(
            colors.rgb8('Adminer (Postgres client) ready', 255),
            38,
          ),
      )
      const { database, user, password } = db_opts!

      const adminer_url =
        `http://localhost:8888?pgsql=postgres&server=postgres&username=${user}&db=${database}`
      console.log(`    ${colors.bold('URL:')} ${colors.cyan(adminer_url)}`)
      console.log(`    ${colors.bold('Password:')} ${password}\n`)
      console.log()
    }
  },
})
