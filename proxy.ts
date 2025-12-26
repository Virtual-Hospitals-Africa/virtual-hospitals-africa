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
const cert_file = './local-certs/localhost.crt'
const key_file = './local-certs/localhost.key'

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
    Deno.readTextFile(cert_file),
    Deno.readTextFile(key_file),
  ])
  cert = certs[0]
  key = certs[1]
  debug('✓ Loaded certificates from ./local-certs/')
} catch (error) {
  console.error('Error loading certificates:', error)
  console.error(`Make sure ${cert_file} and ${key_file} exist`)
  Deno.exit(1)
}

async function handleRequest(request: Request): Promise<Response> {
  debug(`${request.method} ${request.url}`)
  const url = new URL(request.url)

  // Check if this is a WebSocket upgrade request
  const upgrade_header = request.headers.get('upgrade')
  if (upgrade_header?.toLowerCase() === 'websocket') {
    return handleWebSocketUpgrade(request, url)
  }

  url.protocol = 'http:'
  url.port = String(HTTP_SERVER_PORT)

  try {
    // Create a new request with the same properties
    const proxy_headers = new Headers(request.headers)
    proxy_headers.delete('proxy-connection')
    proxy_headers.delete('proxy-authorization')

    // Add headers needed for Fresh to work behind proxy
    proxy_headers.set('x-forwarded-proto', 'https')
    proxy_headers.set('x-forwarded-host', url.hostname)
    proxy_headers.set('x-forwarded-port', String(HTTPS_PROXY_SERVER_PORT))

    const proxy_request = new Request(url, {
      method: request.method,
      headers: proxy_headers,
      body: request.body,
      // @ts-ignore - duplex is needed for streaming
      duplex: request.body ? 'half' : undefined,
      redirect: 'manual', // Don't follow redirects - let the browser handle them
    })
    debug(proxy_request)

    const response = await fetch(proxy_request)

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

function handleWebSocketUpgrade(request: Request, url: URL): Response {
  debug(`WebSocket upgrade request: ${url}`)

  // Upgrade the incoming connection to WebSocket
  const { socket: client_socket, response } = Deno.upgradeWebSocket(request)

  // Create WebSocket connection to the backend server
  const backend_url = new URL(url)
  backend_url.protocol = 'ws:'
  backend_url.port = String(HTTP_SERVER_PORT)

  debug(`Connecting to backend WebSocket: ${backend_url}`)
  const backend_socket = new WebSocket(backend_url.toString())

  backend_socket.onopen = () => {
    debug('Backend WebSocket opened')
  }

  // Forward messages from client to backend
  client_socket.onmessage = (event) => {
    debug(
      'Client -> Backend:',
      typeof event.data === 'string' ? event.data : '[binary]',
    )
    if (backend_socket.readyState === WebSocket.OPEN) {
      backend_socket.send(event.data)
    }
  }

  // Forward messages from backend to client
  backend_socket.onmessage = (event) => {
    debug(
      'Backend -> Client:',
      typeof event.data === 'string' ? event.data : '[binary]',
    )
    if (client_socket.readyState === WebSocket.OPEN) {
      client_socket.send(event.data)
    }
  }

  function closeCode(code: number) {
    switch (code) {
      case 1005:
      case 1001:
        return 1000
      default:
        return code
    }
  }

  // Handle client close
  client_socket.onclose = (event) => {
    debug(`Client WebSocket closed: ${event.code} ${event.reason}`)
    if (
      backend_socket.readyState === WebSocket.OPEN ||
      backend_socket.readyState === WebSocket.CONNECTING
    ) {
      // Normalize close code: 1005 is reserved and cannot be sent
      const close_code = closeCode(event.code)
      backend_socket.close(close_code, event.reason)
    }
  }

  // Handle backend close
  backend_socket.onclose = (event) => {
    debug(`Backend WebSocket closed: ${event.code} ${event.reason}`)
    if (
      client_socket.readyState === WebSocket.OPEN ||
      client_socket.readyState === WebSocket.CONNECTING
    ) {
      // Normalize close code: 1005 is reserved and cannot be sent
      const close_code = event.code === 1005 ? 1000 : event.code
      client_socket.close(close_code, event.reason)
    }
  }

  // Handle client error
  client_socket.onerror = (/* event */) => {
    // console.error('Client WebSocket error:', event)
    if (
      backend_socket.readyState === WebSocket.OPEN ||
      backend_socket.readyState === WebSocket.CONNECTING
    ) {
      backend_socket.close()
    }
  }

  // Handle backend error
  backend_socket.onerror = (/* event */) => {
    // console.error('Backend WebSocket error:', event)
    if (
      client_socket.readyState === WebSocket.OPEN ||
      client_socket.readyState === WebSocket.CONNECTING
    ) {
      client_socket.close()
    }
  }

  return response
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
