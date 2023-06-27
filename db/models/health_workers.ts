import { DeleteResult, sql, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import {
  GoogleTokens,
  HealthWorker,
  HealthWorkerWithGoogleTokens,
  Maybe,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'

// Shave a minute so that we refresh too early rather than too late
const expiresInAnHourSql = sql<
  Date
>`(SELECT now() + (59 * interval '1 minute'))`

export async function upsert(
  trx: TrxOrDb,
  details: HealthWorker,
): Promise<ReturnedSqlRow<HealthWorker>> {
  const [health_worker] = await trx
    .insertInto('health_workers')
    .values(details)
    .onConflict((oc) => oc.column('email').doUpdateSet(details))
    .returningAll()
    .execute()

  return health_worker
}

export async function upsertWithGoogleCredentials(
  trx: TrxOrDb,
  details: HealthWorker & GoogleTokens,
): Promise<ReturnedSqlRow<HealthWorker>> {
  const health_worker = await upsert(
    trx,
    {
      name: details.name,
      email: details.email,
      avatar_url: details.avatar_url,
      gcal_appointments_calendar_id: details.gcal_appointments_calendar_id,
      gcal_availability_calendar_id: details.gcal_availability_calendar_id,
    },
  )

  await trx
    .insertInto('health_worker_google_tokens')
    .values({
      health_worker_id: health_worker.id,
      access_token: details.access_token,
      refresh_token: details.refresh_token,
      expires_at: details.expires_at,
    })
    .onConflict((oc) =>
      oc.column('health_worker_id').doUpdateSet({
        access_token: details.access_token,
        refresh_token: details.refresh_token,
        expires_at: details.expires_at,
      })
    )
    .execute()

  return health_worker
}

const getWithTokensQuery = (trx: TrxOrDb) =>
  trx
    .selectFrom('health_workers')
    .leftJoin(
      'health_worker_google_tokens',
      'health_workers.id',
      'health_worker_google_tokens.health_worker_id',
    )
    .selectAll('health_workers')
    .select('health_worker_google_tokens.access_token')
    .select('health_worker_google_tokens.refresh_token')
    .select('health_worker_google_tokens.expires_at')
    .where('health_worker_google_tokens.access_token', 'is not', null)
    .where('health_worker_google_tokens.refresh_token', 'is not', null)

// TODO: Store auth tokens in a way that we can more easily refresh them and find the ones for a specific health_worker
export async function getAllWithTokens(
  trx: TrxOrDb,
): Promise<HealthWorkerWithGoogleTokens[]> {
  const result = await getWithTokensQuery(trx).execute()
  return withTokens(result)
}

export function isHealthWorkerWithGoogleTokens(
  health_worker: unknown,
): health_worker is HealthWorkerWithGoogleTokens {
  return !!health_worker &&
    typeof health_worker === 'object' &&
    'access_token' in health_worker &&
    typeof health_worker.access_token === 'string' &&
    'refresh_token' in health_worker &&
    typeof health_worker.refresh_token === 'string' &&
    'expires_at' in health_worker &&
    (typeof health_worker.expires_at === 'string' ||
      isDate(health_worker.expires_at)) &&
    'id' in health_worker && typeof health_worker.id === 'number' &&
    'name' in health_worker && typeof health_worker.name === 'string' &&
    'email' in health_worker && typeof health_worker.email === 'string' &&
    'gcal_appointments_calendar_id' in health_worker &&
    typeof health_worker.gcal_appointments_calendar_id === 'string' &&
    'gcal_availability_calendar_id' in health_worker &&
    typeof health_worker.gcal_availability_calendar_id === 'string'
}

function withTokens(health_workers: unknown[]) {
  const withTokens: HealthWorkerWithGoogleTokens[] = []
  for (const health_worker of health_workers) {
    if (!isHealthWorkerWithGoogleTokens(health_worker)) {
      throw new Error('HealthWorker has no access token or refresh token')
    }
    withTokens.push(health_worker)
  }
  return withTokens
}

export async function getAllWithExtantTokens(trx: TrxOrDb): Promise<
  HealthWorkerWithGoogleTokens[]
> {
  return withTokens(await getAllWithTokens(trx))
}

export async function getWithTokensById(
  trx: TrxOrDb,
  health_worker_id: number,
): Promise<Maybe<HealthWorkerWithGoogleTokens>> {
  const [health_worker] = await getWithTokensQuery(trx).where(
    'health_workers.id',
    '=',
    health_worker_id,
  )
    .execute()
  return withTokens([health_worker])[0]
}

export async function allWithGoogleTokensAboutToExpire(trx: TrxOrDb): Promise<
  HealthWorkerWithGoogleTokens[]
> {
  return withTokens(
    await getWithTokensQuery(trx).where(
      'health_worker_google_tokens.expires_at',
      '<',
      sql`now() + (5 * interval '1 minute')`,
    ).execute(),
  )
}

export function updateAccessToken(
  trx: TrxOrDb,
  health_worker_id: number,
  access_token: string,
): Promise<UpdateResult[]> {
  return trx
    .updateTable('health_worker_google_tokens')
    .where('health_worker_id', '=', health_worker_id)
    .set({ access_token, expires_at: expiresInAnHourSql })
    .execute()
}

export function removeExpiredAccessToken(
  trx: TrxOrDb,
  opts: { health_worker_id: number },
): Promise<DeleteResult[]> {
  return trx.deleteFrom('health_worker_google_tokens').where(
    'health_worker_id',
    '=',
    opts.health_worker_id,
  ).execute()
}
