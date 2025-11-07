export function path(
  path: string,
  params: Record<string, unknown> = {},
): string {
  const search_params = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return
    if (Array.isArray(value)) {
      throw new Error('Array params not supported')
    }
    searchParams.append(key, value.toString())
  })
  if (!searchParams.size) return path
  return `${path}?${searchParams.toString()}`
}
