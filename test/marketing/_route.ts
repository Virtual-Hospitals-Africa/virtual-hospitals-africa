export const port = Deno.env.get('MARKETING_HTTP_SERVER_PORT') || (
  Deno.env.get('IS_TEST') ? '8006' : '8002'
)

export const route = Deno.env.get('SCRIPT_VHA_MARKETING_ROUTE') || `http://localhost:${port}`
