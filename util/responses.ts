// deno-lint-ignore no-explicit-any
export function json(data: any) {
  const response = new Response(JSON.stringify(data), { status: 200 })
  response.headers.set('content-type', 'application/json')
  return response
}
