import {
  readBooleanEnvironmentVariable,
  readPositiveIntegerEnvironmentVariable,
} from './util/env.ts'
import { onProduction } from './util/onProduction.ts'
import { opts as db_opts } from './db/db.ts'
import { bgRgb8, bold, cyan, rgb8 } from 'std/fmt/colors.ts'

const VERBOSE = readBooleanEnvironmentVariable('VERBOSE')

const HTTPS_PROXY_SERVER_PORT =
  readPositiveIntegerEnvironmentVariable('HTTPS_PROXY_SERVER_PORT') || 8000
const HTTP_SERVER_PORT =
  readPositiveIntegerEnvironmentVariable('HTTP_SERVER_PORT') || 8001

// Load local certificates
const certFile = './local-certs/localhost.crt'
const keyFile = './local-certs/localhost.key'

let cert: string
let key: string

// deno-lint-ignore no-explicit-any
function debug(...args: any[]) {
  if (VERBOSE) {
    console.log(...args)
  }
}

try {
  const certs = await Promise.all([
    Deno.readTextFile(certFile),
    Deno.readTextFile(keyFile),
  ])
  cert = certs[0]
  key = certs[1]
  debug('✓ Loaded certificates from ./local-certs/')
} catch (error) {
  console.error('Error loading certificates:', error)
  console.error(`Make sure ${certFile} and ${keyFile} exist`)
  Deno.exit(1)
}

async function handleRequest(request: Request): Promise<Response> {
  debug(`${request.method} ${request.url}`)
  const url = new URL(request.url)
  url.protocol = 'http:'
  url.port = String(HTTP_SERVER_PORT)

  try {
    // Create a new request with the same properties
    const proxyHeaders = new Headers(request.headers)
    proxyHeaders.delete('proxy-connection')
    proxyHeaders.delete('proxy-authorization')

    // Add headers needed for Fresh to work behind proxy
    proxyHeaders.set('x-forwarded-proto', 'https')
    proxyHeaders.set('x-forwarded-host', url.hostname)
    proxyHeaders.set('x-forwarded-port', String(HTTPS_PROXY_SERVER_PORT))

    const proxyRequest = new Request(url, {
      method: request.method,
      headers: proxyHeaders,
      body: request.body,
      // @ts-ignore - duplex is needed for streaming
      duplex: request.body ? 'half' : undefined,
      redirect: 'manual', // Don't follow redirects - let the browser handle them
    })
    debug(proxyRequest)

    const response = await fetch(proxyRequest)

    debug(`${request.method} ${request.url}`, response)

    // Forward the response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch (error) {
    console.error(`Failed to proxy ${request.url}:`, error)
    return new Response('Bad Gateway', { status: 502 })
  }
}

// Start the HTTPS proxy server with TLS
debug(
  `Starting HTTPS Proxy server on https://localhost:${HTTPS_PROXY_SERVER_PORT}`,
)
debug('Configure your browser/app to use this proxy')
debug('\nPress Ctrl+C to stop\n')

Deno.serve({
  port: HTTPS_PROXY_SERVER_PORT,
  cert,
  key,
  onListen() {
    debug(`✓ Listening on https://localhost:${HTTPS_PROXY_SERVER_PORT}`)

    const { SERVE_PLAIN_HTTP } = Deno.env.toObject()
    const protocol = SERVE_PLAIN_HTTP ? 'http:' : 'https:'
    const address = `${protocol}//localhost:${HTTPS_PROXY_SERVER_PORT}`

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
  },
}, handleRequest)
