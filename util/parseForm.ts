import set from './set.ts'

export function parseForm<T>(
  params: URLSearchParams | FormData,
  defaultValue: T,
): T {
  params.forEach((value, key) => {
    const toSet = /^\d+$/g.test(value as string)
      ? parseInt(value as string)
      : value
    set(defaultValue, key, toSet)
  })

  return defaultValue
}

export async function parseRequest<T>(
  req: Request,
  defaultValue: T,
): Promise<T> {
  const params = new URLSearchParams(await req.text())
  return parseForm(params, defaultValue)
}
