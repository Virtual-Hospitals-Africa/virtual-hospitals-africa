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
  const fetchWithSession: typeof fetch = (
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ) =>
    fetch(
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

  const fetchCheerio = async (...args: Parameters<typeof fetch>) => {
    const response = await fetchWithSession(...args)
    if (!response.ok) throw new Error(await response.text())
    const html = await response.text()
    return cheerio.load(html, {
      baseURI: response.url,
    })
  }

  return {
    session_id: session.id,
    regulator,
    fetch: fetchWithSession,
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
