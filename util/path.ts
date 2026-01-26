function asURLSearchParams(
  params: Record<string, unknown> | URLSearchParams,
): URLSearchParams {
  if (params instanceof URLSearchParams) return params
  const search_params = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return
    if (Array.isArray(value)) {
      throw new Error('Array params not supported')
    }
    search_params.append(key, value.toString())
  })
  return search_params
}

export function path(
  path: string | URL,
  params: Record<string, unknown> | URLSearchParams = {},
): string {
  const search_params = asURLSearchParams(params)
  if (!search_params.size) return path.toString()
  return `${path}?${search_params.toString()}`
}
