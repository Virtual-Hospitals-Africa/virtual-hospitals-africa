import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../types.ts'
import set from '../util/set.ts'
import { assertOr400 } from '../util/assertOr.ts'
import deepRemoveHoles from '../util/deepRemoveHoles.ts'

type Primitive = string | number | boolean

export type FormValue = Primitive | FormValue[]

export function parseParam(_key: string | undefined, param: string): FormValue {
  if (param === 'true') return true
  if (param === 'on') return true
  if (param === 'false') return false
  if (param === 'off') return false
  if (param[0] === '[' && param.lastIndexOf(']') === (param.length - 1)) {
    return JSON.parse(param)
  }
  if (param[0] === '{' && param.lastIndexOf('}') === (param.length - 1)) {
    return JSON.parse(param)
  }
  return param
}

function parseFormWithoutFilesNoTypeCheck(
  params: URLSearchParams | FormData,
): Record<string, unknown> {
  const parsed = {}
  params.forEach((value, key) => {
    assert(typeof value === 'string')
    if (value === '') return
    set(parsed, key, parseParam(key, value))
  })
  return deepRemoveHoles(parsed)
}

export function parseFormWithoutFiles<T extends Record<string, unknown>>(
  params: URLSearchParams | FormData,
  typeCheck: (obj: unknown) => asserts obj is T,
): T {
  const parsed = parseFormWithoutFilesNoTypeCheck(params)
  typeCheck(parsed)
  return parsed
}

function isBlank(form_data: Maybe<FormData>) {
  if (!form_data) return true
  for (const _key of form_data.keys()) {
    return false
  }
  return true
}

export async function parseRequest<T extends Record<string, unknown>>(
  req: Request,
  parse: (obj: unknown) => T,
): Promise<T> {
  assert(['POST', 'GET'].includes(req.method))

  const content_type = req.headers.get('content-type')

  let body_consumed = false
  let form_data: FormData | undefined
  if (content_type?.startsWith('multipart/form-data')) {
    body_consumed = true
    form_data = await req.formData()
  }

  let values_map: URLSearchParams | FormData
  if (isBlank(form_data)) {
    const text = !body_consumed ? await req.text() : undefined

    values_map = (req.method === 'POST' && text) ? new URLSearchParams(text) : new URL(req.url).searchParams
  } else {
    values_map = form_data!
  }

  // Remove error, warning, success, which may appear in the URL but are never part of form data
  for (const key of ['error', 'warning', 'success']) {
    values_map.delete(key)
  }

  assertOr400(values_map)

  const files: { [key: string]: File } = {}
  values_map.forEach((value, key) => {
    if (value instanceof File) files[key] = value
  })
  Object.keys(files).forEach((key) => values_map.delete(key))

  const parsed = parseFormWithoutFilesNoTypeCheck(values_map)

  // We could write to a file instead of to memory. Either way, better than lugging around the db/trx just for this
  await Promise.all(
    Object.entries(files).map(async ([key, value]) => {
      const buffer = await value.arrayBuffer()
      const binary_data = new Uint8Array(buffer)

      set(parsed, key, {
        binary_data,
        name: value.name,
        mime_type: value.type,
      })
    }),
  )

  delete parsed.omit

  // console.log({ parsed })

  return parse(parsed)
}

export function parseRequestAsserts<T extends Record<string, unknown>>(
  req: Request,
  typeCheck: (obj: unknown) => asserts obj is T,
): Promise<T> {
  return parseRequest(req, (obj) => {
    typeCheck(obj)
    return obj
  })
}
