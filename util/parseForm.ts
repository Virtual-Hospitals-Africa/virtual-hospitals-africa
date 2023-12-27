import { assert } from 'std/assert/assert.ts'
import set from './set.ts'
import * as media from '../db/models/media.ts'
import { TrxOrDb } from '../types.ts'
import { assertOr400 } from './assertOr.ts'
import deepRemoveHoles from './deepRemoveHoles.ts'

type Primitive = string | number | boolean

export type FormValue = Primitive | FormValue[]

export function parseParam(param: string): FormValue {
  if (param === 'true') return true
  if (param === 'on') return true
  if (param === 'false') return false
  if (param === 'off') return false
  if (/^\d+$/g.test(param)) return parseInt(param)
  if (param[0] === '[') return JSON.parse(param)
  return param
}

function parseFormWithoutFilesNoTypeCheck(
  params: URLSearchParams | FormData,
): Record<string, unknown> {
  const parsed = {}
  params.forEach((value, key) => {
    assert(typeof value === 'string')
    if (value === '') return
    set(parsed, key, parseParam(value))
  })
  return deepRemoveHoles(parsed)
}

export function parseFormWithoutFiles<T extends Record<string, unknown>>(
  params: URLSearchParams | FormData,
  typeCheck: (obj: unknown) => obj is T,
): T {
  const parsed = parseFormWithoutFilesNoTypeCheck(params)
  assert(typeCheck(parsed))
  return parsed
}

export async function parseRequestAsserts<T extends Record<string, unknown>>(
  trx: TrxOrDb,
  req: Request,
  assertion: (obj: unknown) => asserts obj is T,
): Promise<T> {
  assert(['POST', 'GET'].includes(req.method))

  const contentType = req.headers.get('content-type')

  let formData: FormData | URLSearchParams | undefined

  if (contentType?.startsWith('multipart/form-data')) {
    try {
      formData = await req.formData()
    } catch (err) {
      console.error(err)
    }
  }
  if (!formData) {
    const text = await req.text()

    formData = req.method === 'POST' && text
      ? new URLSearchParams(text)
      : new URL(req.url).searchParams
  }

  assertOr400(formData)

  const files: { [key: string]: File } = {}
  formData.forEach((value, key) => {
    if (value instanceof File) files[key] = value
  })
  Object.keys(files).forEach((key) => formData!.delete(key))

  const parsed = parseFormWithoutFilesNoTypeCheck(formData)

  await Promise.all(
    Object.entries(files).map(async ([key, value]) => {
      const inserted = await media.insert(trx, {
        mime_type: value.type,
        binary_data: new Uint8Array(await value.arrayBuffer()),
      })
      set(parsed, key, {
        ...inserted,
        name: value.name,
      })
    }),
  )

  assertion(parsed)
  return parsed
}

export async function parseRequest<T extends Record<string, unknown>>(
  trx: TrxOrDb,
  req: Request,
  typeCheck: (obj: unknown) => obj is T,
): Promise<T> {
  assert(['POST', 'GET'].includes(req.method))

  const contentType = req.headers.get('content-type')

  let formData: FormData | URLSearchParams | undefined

  if (contentType?.startsWith('multipart/form-data')) {
    try {
      formData = await req.formData()
    } catch (err) {
      console.error(err)
    }
  }
  if (!formData) {
    const text = await req.text()

    formData = req.method === 'POST' && text
      ? new URLSearchParams(text)
      : new URL(req.url).searchParams
  }

  assertOr400(formData)

  const files: { [key: string]: File } = {}
  formData.forEach((value, key) => {
    if (value instanceof File) files[key] = value
  })
  Object.keys(files).forEach((key) => formData!.delete(key))

  const parsed = parseFormWithoutFilesNoTypeCheck(formData)

  await Promise.all(
    Object.entries(files).map(async ([key, value]) => {
      const inserted = await media.insert(trx, {
        mime_type: value.type,
        binary_data: new Uint8Array(await value.arrayBuffer()),
      })
      set(parsed, key, {
        ...inserted,
        name: value.name,
      })
    }),
  )

  assert(typeCheck(parsed))
  return parsed
}
