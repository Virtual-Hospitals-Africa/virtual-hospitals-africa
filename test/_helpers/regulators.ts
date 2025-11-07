import * as cheerio from 'cheerio'
import { HasStringId, Regulator, TrxOrDb } from '../../types.ts'
import * as sessions from '../../db/models/sessions.ts'
import * as regulators from '../../db/models/regulators.ts'
import db from '../../db/db.ts'
import generateUUID from '../../util/uuid.ts'
import { route } from '../route.ts'

export function testRegulator() {
  return {
    name: `Test Regulator ${generateUUID()}`,
    email: generateUUID() + '@example.com',
    avatar_url: generateUUID() + '.com',
    country: 'ZA',
  }
}

export async function addTestRegulator(
  trx: TrxOrDb,
) {
  const createdRegulator = await regulators.upsert(trx, {
    ...testRegulator(),
  })
  return createdRegulator
}

export async function addTestRegulatorWithSession(
  trx: TrxOrDb,
) {
  const regulator = await addTestRegulator(trx)
  const session = await sessions.create(trx, 'regulator', {
    entity_id: regulator.id,
  })
  function fetchWithSession(
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ): ReturnType<typeof fetch> {
    return fetch(
      typeof input === 'string' && input.startsWith('/')
        ? `${route}${input}`
        : input,
      {
        headers: {
          ...headers,
          Cookie: `session_id=${session.id}`,
        },
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
    if (!response.ok) {
      const method = init?.method || 'GET'
      console.error(`${method} ${url}`)
      if (init?.body) {
        console.error(init.body)
      }
      throw new Error(`[${response.status}]: ${await response.text()}`)
    }
    if (opts?.cancel_response_body) {
      await response.body?.cancel()
    }
    return response
  }

  const fetchCheerio = async (url: string | URL, init?: RequestInit) => {
    const response = await fetchOk(url, init)
    const html = await response.text()
    const $ = cheerio.load(html, {
      baseURI: response.url,
    })
    return Object.assign($, {
      url: response.url,
    })
  }

  return {
    session_id: session.id,
    regulator,
    fetch: fetchWithSession,
    fetchOk,
    fetchCheerio,
  }
}

export function withTestRegulator(
  callback: (trx: TrxOrDb, regulator: HasStringId<Regulator>) => Promise<void>,
) {
  return async function (trx: TrxOrDb) {
    const regulator = await addTestRegulator(db)
    return callback(trx, regulator)
  }
}
