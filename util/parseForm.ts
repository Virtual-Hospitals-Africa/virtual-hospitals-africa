import { assert } from 'std/testing/asserts.ts'
import set from './set.ts'
import { isIsoHarare } from './date.ts'

type Primitive = string | number | boolean | Date
export type FormValue = Primitive | FormValue[]

export function parseForm<T>(
  params: URLSearchParams | FormData,
  // deno-lint-ignore no-explicit-any
  defaultValue: T extends Array<any> ? T : Partial<T>,
  typeCheck: (obj: unknown) => obj is T,
): T {
  function parseParam(param: string): FormValue {
    if (param === 'true') return true
    if (param === 'on') return true
    if (param === 'false') return false
    if (param === 'off') return false
    if (/^\d+$/g.test(param)) return parseInt(param)
    if (param[0] === '[') return JSON.parse(param)
    if (isIsoHarare(param)) return new Date(param)
    return param
  }

  params.forEach((value, key) => {
    assert(typeof value === 'string')
    set(defaultValue, key, parseParam(value))
  })

  assert(typeCheck(defaultValue))

  return defaultValue
}

export async function parseRequest<T>(
  req: Request,
  // deno-lint-ignore no-explicit-any
  defaultValue: T extends Array<any> ? T : Partial<T>,
  typeCheck: (obj: unknown) => obj is T,
): Promise<T> {
  assert(['POST', 'GET'].includes(req.method))

  const searchParams = new URL(req.url).searchParams

  const text = await req.text()

  const params = req.method === 'POST' && text
    ? new URLSearchParams(text)
    : searchParams

  return parseForm(params, defaultValue, typeCheck)
}
