import { App, staticFiles } from 'fresh'
import httpsUrlPlugin from './plugins/httpsUrl.ts'
import { onProduction } from './util/onProduction.ts'
import { opts as db_opts } from './db/db.ts'
import { bgRgb8, bold, cyan, rgb8 } from 'std/fmt/colors.ts'

// Pretty print startup info
const { SERVE_PLAIN_HTTP, PORT } = Deno.env.toObject()
const protocol = SERVE_PLAIN_HTTP ? 'http:' : 'https:'
const port = PORT ? parseInt(PORT, 10) : 8000
const address = `${protocol}//localhost:${port}`

console.log()
console.log(
  ' 🩺 ' +
    bgRgb8(rgb8('Virtual Hospitals Africa ready', 255), 57),
)
const is_prod = onProduction()
if (is_prod) {
  console.log(
    `     ` +
      bgRgb8(rgb8('(running against production)', 255), 59),
  )
  console.log()
}
console.log(`    ${bold('URL:')} ${cyan(address)}\n`)

if (Deno.env.get('USE_DOCKER_FOR_POSTGRES')) {
  console.log(
    ' 💽 ' +
      bgRgb8(
        rgb8('Adminer (Postgres client) ready', 255),
        38,
      ),
  )
  const { database, user, password } = db_opts!
  const adminer_url =
    `http://localhost:8888?pgsql=postgres&server=postgres&username=${user}&db=${database}`
  console.log(`    ${bold('URL:')} ${cyan(adminer_url)}`)
  console.log(`    ${bold('Password:')} ${password}\n`)
  console.log()
}

export const app = new App()
  // Add HTTPS URL middleware
  .use(httpsUrlPlugin().middlewares[0].middleware.handler)
  // Add static file serving middleware
  .use(staticFiles())
  // Enable file-system based routing
  .fsRoutes()
