import * as cheerio from 'cheerio'
import { sessions } from '../../db/models/sessions.ts'
import { addTestEmployee, TestHealthWorkerOpts } from '../../mocks/testEmployee.ts'
import { TrxOrDb, Maybe, Falsy } from '../../types.ts'
import compact from '../../util/compact.ts'
import { route } from '../_route.ts'

export type TestEmployeeWithSession = Awaited<ReturnType<typeof addTestEmployeeWithSession>>

export async function addTestEmployeeWithSession(
  trx: TrxOrDb,
  opts?: TestHealthWorkerOpts,
) {
  const health_worker = await addTestEmployee(trx, opts)
  const session_id = await sessions.insertOne(trx, {
    entity_type: 'health_worker',
    entity_id: health_worker.id,
  })
  const Cookie = `session_id=${session_id}`

  function fetchWithSession(
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ): ReturnType<typeof fetch> {
    return fetch(
      typeof input === 'string' && input.startsWith('/') ? `${route}${input}` : input,
      {
        headers: { ...headers, Cookie },
        ...rest,
      },
    )
  }

  const fetchOk = async (
    url: string | URL,
    init?: RequestInit,
    opts?: { cancel_response_body?: boolean },
  ) => {
    const response = await fetchWithSession(url, init)
    if (response.ok) {
      if (opts?.cancel_response_body) {
        await response.body?.cancel()
      }
      return response
    }

    const method = init?.method || 'GET'
    const content_type = response.headers.get('content-type')
    const include_response_text = !content_type?.startsWith('text/html')
    const response_text = include_response_text && await response.text()

    throw new Error(
      compact([
        compact([`[${response.status}]`, response_text]).join(': '),
        maybeIndent(`${method} ${url}`),
        maybeIndent(prettyPrintBody(init?.body)),
      ]).join('\n'),
    )
  }

  function prettyPrintBody(body: Maybe<BodyInit>) {
    if (body == null) return
    if (body instanceof FormData) {
      const inner = [...body.entries()].map(([k, v]) => `  ${k}: ${v}`).join(
        '\n',
      )
      return `FormData {\n${inner}\n}`
    }
    return body.toString()
  }

  function maybeIndent(lines: Falsy | string) {
    if (!lines) return
    return lines.split('\n').map((line) => '  ' + line).join('\n')
  }

  const fetchJson = async (
    url: string | URL,
    init?: RequestInit,
  ) => {
    const response = await fetchOk(url, {
      ...init,
      headers: {
        ...init?.headers,
        Accept: 'application/json',
      },
    })
    return response.json()
  }

  const fetchCheerio = async (url: string | URL, init?: RequestInit) => {
    const response = await fetchOk(url, init)
    const html = await response.text()
    const $ = cheerio.load(html, {
      baseURI: response.url,
    })

    // We aren't testing CSS. This keeps the output small enough where it can be easily copied.
    $('style').remove()

    return Object.assign($, {
      url: response.url,
    })
  }

  return {
    session_id,
    Cookie,
    health_worker,
    fetch: fetchWithSession,
    fetchOk,
    fetchJson,
    fetchCheerio,
  }
}
