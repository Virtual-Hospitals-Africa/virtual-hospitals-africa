import { assert } from 'std/testing/asserts.ts'
import set from './set.ts'
import * as media from '../db/models/media.ts'
import { isRfc3339 } from './date.ts'
import { TrxOrDb } from '../types.ts'

type Primitive = string | number | boolean | Date
export type FormValue = Primitive | FormValue[]

export function parseParam(param: string): FormValue {
  if (param === 'true') return true
  if (param === 'on') return true
  if (param === 'false') return false
  if (param === 'off') return false
  if (/^\d+$/g.test(param)) return parseInt(param)
  if (param[0] === '[') return JSON.parse(param)
  if (isRfc3339(param)) return new Date(param)
  return param
}

function parseFormWithoutFilesNoTypeCheck(
  params: URLSearchParams | FormData,
): Record<string, unknown> {
  const parsed = {}
  params.forEach((value, key) => {
    assert(typeof value === 'string')
    set(parsed, key, parseParam(value))
  })
  return parsed
}

export function parseFormWithoutFiles<T extends Record<string, unknown>>(
  params: URLSearchParams | FormData,
  typeCheck: (obj: unknown) => obj is T,
): T {
  const parsed = parseFormWithoutFilesNoTypeCheck(params)
  assert(typeCheck(parsed))
  return parsed
}

export async function parseRequest<T extends Record<string, unknown>>(
  trx: TrxOrDb,
  req: Request,
  typeCheck: (obj: unknown) => obj is T,
): Promise<T> {
  assert(['POST', 'GET'].includes(req.method))

  const contentType = req.headers.get('content-type')

  let formData: FormData | URLSearchParams
  if (contentType?.startsWith('multipart/form-data')) {
    formData = await req.formData()
  } else {
    const text = await req.text()

    formData = req.method === 'POST' && text
      ? new URLSearchParams(text)
      : new URL(req.url).searchParams
  }

  const files: { [key: string]: File } = {}
  formData.forEach((value, key) => {
    if (value instanceof File) files[key] = value
  })
  Object.keys(files).forEach((key) => formData.delete(key))

  const parsed = parseFormWithoutFilesNoTypeCheck(formData)

  await Promise.all(
    Object.entries(files).map(async ([key, value]) => {
      const inserted = await media.insert(trx, {
        mime_type: value.type,
        binary_data: new Uint8Array(await value.arrayBuffer()),
      })
<<<<<<< HEAD
      set(parsed, key, {
        ...inserted,
        name: value.name,
      })
=======
      set(parsed, key, inserted)
      console.log(inserted)
>>>>>>> 455cfe0 (parseform function)
    }),
  )

  assert(typeCheck(parsed))
  return parsed
}
