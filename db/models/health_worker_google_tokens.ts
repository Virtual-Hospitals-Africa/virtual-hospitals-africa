import { DeleteResult, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import { GoogleTokens, TrxOrDb } from '../../types.ts'
import pick from '../../util/pick.ts'
import { health_workers } from './health_workers.ts'
import { google_tokens } from './google_tokens.ts'
import { combine } from '../../util/combine.ts'
import { type HealthWorkerUpsert } from './health_workers.ts'
import { assert } from 'std/assert/assert.ts'
import { NameInputs } from './asNames.ts'

export type HealthWorkerWithGoogleTokens = Awaited<
  ReturnType<typeof insertWithGoogleCredentials>
>

async function insertWithGoogleCredentials(
  trx: TrxOrDb,
  {
    access_token,
    refresh_token,
    expires_at,
    expires_in: _expires_in,
    ...health_worker_details
  }:
    & HealthWorkerUpsert
    & NameInputs
    & GoogleTokens
    & {
      expires_in?: string | number | Date
    },
) {
  assert(!health_worker_details.id)
  const id = await health_workers.insertOne(
    trx,
    health_worker_details,
  )
  const tokens = {
    access_token,
    refresh_token,
    expires_at,
  }

  await google_tokens.upsert(trx, 'health_worker', id, tokens)
  return combine({ id, ...health_worker_details }, tokens)
}

export const pickTokens = pick(['access_token', 'refresh_token', 'expires_at'])

export const health_worker_google_tokens = {
  insertWithGoogleCredentials,
  updateTokens(
    trx: TrxOrDb,
    email: string,
    tokens: GoogleTokens,
  ): Promise<null | { id: string }> {
    return google_tokens.updateTokensByEmail(
      trx,
      'health_worker',
      email,
      tokens,
    )
  },
  getWithTokensQuery(trx: TrxOrDb) {
    return trx
      .selectFrom('health_workers')
      .innerJoin('google_tokens', (join) =>
        join
          .onRef('health_workers.id', '=', 'google_tokens.entity_id')
          .on('google_tokens.entity_type', '=', 'health_worker'))
      .select([
        'health_workers.id',
        'email',
        'name',
        'access_token',
        'refresh_token',
        'expires_at',
      ])
  },
  isHealthWorkerWithGoogleTokens(
    health_worker: unknown,
  ): health_worker is HealthWorkerWithGoogleTokens {
    return (
      health_workers.isHealthWorker(health_worker) &&
      'access_token' in health_worker &&
      typeof health_worker.access_token === 'string' &&
      'refresh_token' in health_worker &&
      typeof health_worker.refresh_token === 'string' &&
      'expires_at' in health_worker &&
      (typeof health_worker.expires_at === 'string' ||
        isDate(health_worker.expires_at))
    )
  },
  updateAccessToken(
    trx: TrxOrDb,
    health_worker_id: string,
    access_token: string,
  ): Promise<UpdateResult> {
    return google_tokens.updateAccessToken(
      trx,
      'health_worker',
      health_worker_id,
      access_token,
    )
  },
  removeExpiredAccessToken(
    trx: TrxOrDb,
    opts: { health_worker_id: string },
  ): Promise<DeleteResult> {
    return google_tokens.removeExpiredAccessToken(
      trx,
      'health_worker',
      opts.health_worker_id,
    )
  },
}
