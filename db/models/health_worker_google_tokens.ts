import type { DeleteResult, UpdateResult } from 'kysely'
import type { GoogleTokens, TrxOrDbOrQueryCreator } from '../../types.ts'
import pick from '../../util/pick.ts'
import { health_workers } from './health_workers.ts'
import { google_tokens } from './google_tokens.ts'
import { combine } from '../../util/combine.ts'
import { asNames, NameInputs } from '../../util/asNames.ts'

export type HealthWorkerWithGoogleTokens = Awaited<
  ReturnType<typeof insertWithGoogleCredentials>
>

async function insertWithGoogleCredentials(
  trx: TrxOrDbOrQueryCreator,
  {
    access_token,
    refresh_token,
    expires_at,
    avatar_media_id,
    email,
    expires_in: _expires_in,
    ...health_worker_details
  }:
    & NameInputs
    & GoogleTokens
    & {
      avatar_media_id?: string | null
      email: string
      expires_in?: string | number | Date
    },
) {
  const id = await health_workers.insertOne(
    trx,
    {
      ...health_worker_details,
      ...asNames(health_worker_details),
    },
  )
  const tokens = {
    access_token,
    refresh_token,
    expires_at,
  }

  await Promise.all([
    trx.insertInto('health_worker_accounts').values({ id, email, avatar_media_id }).execute(),
    google_tokens.upsert(trx, 'health_worker', id, tokens),
  ])
  return combine({ id, email, ...health_worker_details }, tokens)
}

export const pickTokens = pick(['access_token', 'refresh_token', 'expires_at'])

export const health_worker_google_tokens = {
  insertWithGoogleCredentials,
  updateTokens(
    trx: TrxOrDbOrQueryCreator,
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
  updateAccessToken(
    trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
    opts: { health_worker_id: string },
  ): Promise<DeleteResult> {
    return google_tokens.removeExpiredAccessToken(
      trx,
      'health_worker',
      opts.health_worker_id,
    )
  },
}
