import { assert } from 'std/assert/assert.ts'

export function replaceParams(route: string, params: Record<string, string>) {
  let replaced = route
  for (const param in params) {
    const placeholder = `/:${param}`
    const paramValue = `/${params[param]}`
    replaced = replaced.replace(placeholder, paramValue)
  }
  assert(
    !replaced.includes(':'),
    `replaceParams failed to replace all params\nreplaceParams("${route}", ${
      JSON.stringify(params)
    }) => "${replaced}"`,
  )
  return replaced
}
