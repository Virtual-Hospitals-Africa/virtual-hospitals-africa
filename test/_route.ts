// With this we can use test functions connecting to the dev server, such as for scripts
export const port = Deno.env.get('HTTP_SERVER_PORT') || (
  Deno.env.get('IS_TEST') ? '8004' : '8000'
)

export const route = Deno.env.get('SCRIPT_VHA_ROUTE') || `http://localhost:${port}`

export const wss_route = `ws://localhost:${port}`
