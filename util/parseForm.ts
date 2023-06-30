import set from './set.ts'

export default function parseForm<T>(
  params: URLSearchParams | FormData,
  defaultValue: T
): T {
  params.forEach((value, key) => {
    const toSet = /^\d+$/g.test(value as string)
      ? parseInt(value as string)
      : value
    set(defaultValue, key, toSet)
  })

  return defaultValue
}
