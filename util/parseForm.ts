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

async function parseFile(
  formData: FormData,
  fileFieldKey?: string,
): Promise<FormData> {
  const updatedForm: FormData = new FormData()
  for (const [key, value] of formData.entries()) {
    if (!(value instanceof File) || key !== fileFieldKey) {
      updatedForm.append(key, value)
      continue
    }
    const uuid = crypto.randomUUID()
    const file: File = value
    const fileName = file.name
    const filePath = `temp/${uuid}-${fileName}`
    const arrayBuffer = await file.arrayBuffer();
    await Deno.writeFile(filePath, new Uint8Array(arrayBuffer), { mode: 0o777 })
    updatedForm.append(fileFieldKey, filePath)
  }
  return updatedForm
}

export async function parseRequest<T>(
  req: Request,
  // deno-lint-ignore no-explicit-any
  defaultValue: T extends Array<any> ? T : Partial<T>,
  typeCheck: (obj: unknown) => obj is T,
  fileFieldKey?: string,
): Promise<T> {
  assert(['POST', 'GET'].includes(req.method))

  const contentType = req.headers.get('content-type')

  const searchParams = new URL(req.url).searchParams
  
  let formData = await req.formData()

  if (contentType?.startsWith('multipart/form-data') && fileFieldKey) {
    formData = await parseFile(formData, fileFieldKey)
  }
  
  const text = parseFormDataToQueryString(formData)

  const params = req.method === 'POST' && text
    ? new URLSearchParams(text)
    : searchParams

  return parseForm(params, defaultValue, typeCheck)
}


function parseFormDataToQueryString(formData: FormData) {
  const queryString = [];
  for (const [key, value] of formData.entries()) {
    queryString.push(`${key}=${value}`);
  }
  return queryString.join("&");
}