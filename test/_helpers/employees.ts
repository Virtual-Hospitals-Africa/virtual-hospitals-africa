import * as cheerio from 'cheerio'
import { sessions } from '../../db/models/sessions.ts'
import { Falsy, Maybe, TrxOrDb } from '../../types.ts'
import compact from '../../util/compact.ts'
import { route } from '../_route.ts'
import { addTestEmployee, TestHealthWorkerOpts } from '../../mocks/testEmployee.ts'
export { addTestEmployee }
export type { TestHealthWorkerOpts }

type RequestTiming = { method: string; path: string; duration_ms: number }
const request_timings_map = new Map<string, RequestTiming[]>()

export function getRequestTimings(session_id: string): RequestTiming[] {
  return request_timings_map.get(session_id) ?? []
}

export type TestEmployeeWithSession = Awaited<ReturnType<typeof addTestEmployeeWithSession>>

export async function addTestEmployeeWithSession(
  trx: TrxOrDb,
  opts?: TestHealthWorkerOpts,
) {
  const health_worker = await addTestEmployee(trx, opts)
  return addSessionForEmployee(trx, health_worker)
}

export async function addSessionForEmployee<HealthWorker extends { id: string }>(
  trx: TrxOrDb,
  health_worker: HealthWorker,
) {
  const session_id = await sessions.insertOne(trx, {
    entity_type: 'health_worker',
    entity_id: health_worker.id,
  })
  const Cookie = `session_id=${session_id}; health_worker_id=${health_worker.id}`

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

  const fetchJSON = async (
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
    const start = performance.now()
    const response = await fetchOk(url, init)
    const html = await response.text()
    const duration_ms = Math.round(performance.now() - start)

    const method = (init?.method ?? 'GET').toUpperCase()
    const path = typeof url === 'string' ? url : url.toString()
    const timings = request_timings_map.get(session_id) ?? []
    timings.push({ method, path, duration_ms })
    request_timings_map.set(session_id, timings)

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
    fetchJSON,
    fetchCheerio,
  }
}
