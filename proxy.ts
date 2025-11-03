#!/usr/bin/env -S deno run --allow-net --allow-read

/**
 * HTTPS Proxy Server for Deno 2
 * Usage: deno run --allow-net --allow-read proxy.ts [port]
 */

const HTTPS_PROXY_SERVER_PORT = 8000
const HTTP_SERVER_PORT = 8002

// Load local certificates
const certFile = './local-certs/localhost.crt'
const keyFile = './local-certs/localhost.key'

let cert: string
let key: string

try {
  cert = await Deno.readTextFile(certFile)
  key = await Deno.readTextFile(keyFile)
  console.log('✓ Loaded certificates from ./local-certs/')
} catch (error) {
  console.error('Error loading certificates:', error)
  console.error(`Make sure ${certFile} and ${keyFile} exist`)
  Deno.exit(1)
}

async function handleRequest(
  request: Request,
  info: Deno.ServeHandlerInfo,
): Promise<Response> {
  console.log(`${request.method} ${request.url}`)
  try {
    if (request.method === 'CONNECT') {
      // Handle HTTPS CONNECT tunneling
      return await handleConnect(request, info)
    } else {
      // Handle regular HTTP proxy
      return await handleHttpProxy(request)
    }
  } catch (error) {
    console.error('Error handling request:', error)
    return new Response('Proxy Error', { status: 500 })
  }
}

async function handleConnect(
  request: Request,
  info: Deno.ServeHandlerInfo,
): Promise<Response> {
  try {
    console.log('attempting connection')
    // Connect to the target server
    const target = await Deno.connect({
      hostname: 'localhost',
      port: HTTP_SERVER_PORT,
    })

    // Upgrade the connection for tunneling using info.completed
    const response = new Response(null, { status: 101 })

    info.completed.then(async (conn) => {
      // Tunnel data between client and target
      await Promise.all([
        copy(conn, target),
        copy(target, conn),
      ]).finally(() => {
        try {
          conn.close()
        } catch {}
        try {
          target.close()
        } catch {}
      })
    })

    return response
  } catch (error) {
    console.error(`Failed to connect`, error)
    return new Response('Bad Gateway', { status: 502 })
  }
}

async function handleHttpProxy(request: Request): Promise<Response> {
  console.log(`${request.method} ${request.url}`)
  const url = new URL(request.url)
  url.protocol = 'http:'
  url.port = String(HTTP_SERVER_PORT)

  try {
    // Create a new request with the same properties
    const proxyHeaders = new Headers(request.headers)
    proxyHeaders.delete('proxy-connection')
    proxyHeaders.delete('proxy-authorization')

    const proxyRequest = new Request(url, {
      method: request.method,
      headers: proxyHeaders,
      body: request.body,
      // @ts-ignore - duplex is needed for streaming
      duplex: request.body ? 'half' : undefined,
    })
    console.log(proxyRequest)

    const response = await fetch(proxyRequest)

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

async function copy(
  reader: ReadableStream<Uint8Array> | Deno.Conn,
  writer: WritableStream<Uint8Array> | Deno.Conn,
) {
  try {
    if (reader instanceof ReadableStream && writer instanceof WritableStream) {
      await reader.pipeTo(writer, { preventClose: true })
    } else if ('read' in reader && 'write' in writer) {
      // Deno.Conn to Deno.Conn
      const buffer = new Uint8Array(32 * 1024)
      while (true) {
        const n = await reader.read(buffer)
        if (n === null) break

        let written = 0
        while (written < n) {
          written += await writer.write(buffer.subarray(written, n))
        }
      }
    } else {
      // Mixed types - convert to streams
      const readStream = reader instanceof ReadableStream
        ? reader
        : reader.readable
      const writeStream = writer instanceof WritableStream
        ? writer
        : writer.writable
      await readStream.pipeTo(writeStream, { preventClose: true })
    }
  } catch (error) {
    // Connection closed or error, exit gracefully
  }
}

// Start the HTTPS proxy server with TLS
console.log(
  `Starting HTTPS Proxy server on https://localhost:${HTTPS_PROXY_SERVER_PORT}`,
)
console.log('Configure your browser/app to use this proxy')
console.log('\nPress Ctrl+C to stop\n')

Deno.serve({
  port: HTTPS_PROXY_SERVER_PORT,
  cert,
  key,
  onListen: ({ hostname, port }) => {
    console.log(`✓ Listening on https://${hostname}:${HTTPS_PROXY_SERVER_PORT}`)
  },
}, handleRequest)
