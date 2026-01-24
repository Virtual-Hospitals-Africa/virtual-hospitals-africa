export const port = Deno.env.get('HTTPS_PROXY_SERVER_PORT') || '8005'

export const route = `https://localhost:${port}`

export const wss_route = `wss://localhost:${port}`
