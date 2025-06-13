import { assert } from 'std/assert/assert.ts'

export function replaceParams(route: string, params: Record<string, string>) {
  let replaced = route
  for (const param in params) {
    const path_placeholder = `/:${param}`
    const path_value = `/${params[param]}`
    const query_placeholder = `=:${param}`
    const query_value = `=${params[param]}`
    replaced = replaced.replace(path_placeholder, path_value).replace(
      query_placeholder,
      query_value,
    )
  }
  assert(
    !replaced.includes(':'),
    `replaceParams failed to replace all params\nreplaceParams("${route}", ${
      JSON.stringify(params)
    }) => "${replaced}"`,
  )
  return replaced
}
