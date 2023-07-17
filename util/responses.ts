// deno-lint-ignore no-explicit-any
export function json(data: any) {
  const response = new Response(JSON.stringify(data), { status: 200 })
  response.headers.set('content-type', 'application/json')
  return response
}

// deno-lint-ignore no-explicit-any
export function file(data: any, type: string) {
  const response = new Response(data, { status: 200 })
  response.headers.set('content-type', type)
  return response
}