import { DeleteResult, sql, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import {
  EmployedHealthWorker,
  EmploymentInfo,
  GoogleTokens,
  HealthWorker,
  HealthWorkerWithGoogleTokens,
  Maybe,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import haveNames from '../../util/haveNames.ts'
import pick from '../../util/pick.ts'

// Shave a minute so that we refresh too early rather than too late
const expiresInAnHourSql = sql<
  Date
>`(SELECT now() + (59 * interval '1 minute'))`

export function upsert(
  trx: TrxOrDb,
  details: HealthWorker,
): Promise<ReturnedSqlRow<HealthWorker>> {
  return trx
    .insertInto('health_workers')
    .values(details)
    .onConflict((oc) => oc.column('email').doUpdateSet(details))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const pickTokens = pick(['access_token', 'refresh_token', 'expires_at'])

export function upsertGoogleTokens(
  trx: TrxOrDb,
  health_worker_id: number,
  tokens: GoogleTokens,
): Promise<ReturnedSqlRow<GoogleTokens> | undefined> {
  assert(health_worker_id)
  return trx
    .insertInto('health_worker_google_tokens')
    .values({
      health_worker_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    })
    .onConflict((oc) =>
      oc.column('health_worker_id').doUpdateSet({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
      })
    )
    .returningAll()
    .executeTakeFirst()
}

export async function updateTokens(
  trx: TrxOrDb,
  email: string,
  tokens: GoogleTokens,
) {
  const healthWorker = await get(trx, { email })
  if (!healthWorker) return null
  await upsertGoogleTokens(trx, healthWorker.id, tokens)
  return healthWorker
}

const pickHealthWorkerDetails = pick([
  'name',
  'email',
  'avatar_url',
  'gcal_appointments_calendar_id',
  'gcal_availability_calendar_id',
])

export async function upsertWithGoogleCredentials(
  trx: TrxOrDb,
  details: HealthWorker & GoogleTokens,
): Promise<HealthWorkerWithGoogleTokens> {
  const health_worker = await upsert(trx, pickHealthWorkerDetails(details))
  const tokens = pickTokens(details)
  assert(tokens.access_token)
  assert(tokens.refresh_token)
  assert(tokens.expires_at)
  await upsertGoogleTokens(
    trx,
    health_worker.id,
    tokens,
  )
  return { ...health_worker, ...tokens }
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

export function isEmployed(
  health_worker: unknown,
): health_worker is EmployedHealthWorker & HealthWorkerWithGoogleTokens {
  return isHealthWorkerWithGoogleTokens(health_worker) &&
    'employment' in health_worker &&
    Array.isArray(health_worker.employment) &&
    !!health_worker.employment.length
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
  const health_worker = await getWithTokensQuery(trx).where(
    'health_workers.id',
    '=',
    health_worker_id,
  )
    .executeTakeFirstOrThrow()
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
): Promise<UpdateResult> {
  return trx
    .updateTable('health_worker_google_tokens')
    .where('health_worker_id', '=', health_worker_id)
    .set({ access_token, expires_at: expiresInAnHourSql })
    .executeTakeFirstOrThrow()
}

export function removeExpiredAccessToken(
  trx: TrxOrDb,
  opts: { health_worker_id: number },
): Promise<DeleteResult> {
  return trx.deleteFrom('health_worker_google_tokens').where(
    'health_worker_id',
    '=',
    opts.health_worker_id,
  ).executeTakeFirstOrThrow()
}

export async function getAllWithNames(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<ReturnedSqlRow<HealthWorker & { name: string }>[]> {
  let query = trx
    .selectFrom('health_workers')
    .selectAll()
    .where('name', 'is not', null)

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  const healthWorkers = await query.execute()

  assert(haveNames(healthWorkers))

  return healthWorkers
}

export async function get(
  trx: TrxOrDb,
  opts: {
    email?: string
    health_worker_id?: number
  },
): Promise<Maybe<EmployedHealthWorker>> {
  let query = trx
    .selectFrom('health_workers')
    .leftJoin(
      'nurse_registration_details',
      'health_workers.id',
      'nurse_registration_details.health_worker_id',
    )
    .innerJoin(
      'health_worker_google_tokens',
      'health_workers.id',
      'health_worker_google_tokens.health_worker_id',
    )
    .select((eb) => [
      'health_workers.id',
      'health_workers.created_at',
      'health_workers.updated_at',
      'health_workers.name',
      'health_workers.email',
      'health_workers.avatar_url',
      'health_workers.gcal_appointments_calendar_id',
      'health_workers.gcal_availability_calendar_id',
      'health_worker_google_tokens.access_token',
      'health_worker_google_tokens.refresh_token',
      'health_worker_google_tokens.expires_at',
      'nurse_registration_details.health_worker_id',
      'nurse_registration_details.approved_by',
      jsonArrayFrom(
        eb.selectFrom('employment')
          .select([
            'employment.facility_id',
            sql<Profession[]>`JSON_AGG(employment.profession)`.as(
              'professions',
            ),
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          )
          .groupBy('employment.facility_id'),
      ).as('facilities'),
    ])

  if (opts.email) query = query.where('health_workers.email', '=', opts.email)
  if (opts.health_worker_id) {
    query = query.where(
      'health_workers.id',
      '=',
      opts.health_worker_id,
    )
  }

  const result = await query.executeTakeFirst()

  return result && {
    id: result.id,
    created_at: result.created_at,
    updated_at: result.updated_at,
    ...pickHealthWorkerDetails(result),
    ...pickTokens(result),
    employment: result.facilities.map((f) => ({
      facility_id: f.facility_id,
      roles: {
        nurse: f.professions.includes('nurse')
          ? {
            employed_as: true,
            registration_needed: !result.health_worker_id,
            registration_completed: !!result.approved_by,
            registration_pending_approval: !result.approved_by,
          }
          : {
            employed_as: false,
            registration_needed: false,
            registration_completed: false,
            registration_pending_approval: false,
          },
        doctor: f.professions.includes('doctor')
          ? {
            employed_as: true,
            registration_needed: false,
            registration_completed: true,
            registration_pending_approval: false,
          }
          : {
            employed_as: false,
            registration_needed: false,
            registration_completed: false,
            registration_pending_approval: false,
          },
        admin: f.professions.includes('admin')
          ? {
            employed_as: true,
            registration_needed: false,
            registration_completed: true,
            registration_pending_approval: false,
          }
          : {
            employed_as: false,
            registration_needed: false,
            registration_completed: false,
            registration_pending_approval: false,
          },
      },
    })),
  }
}

export async function getInviteesAtFacility(
  trx: TrxOrDb,
  facilityId: number,
) {
  return await trx
    .selectFrom('health_worker_invitees')
    .where('facility_id', '=', facilityId)
    .select([
      'id',
      'email',
      'profession',
    ])
    .execute()
}

export async function getEmploymentInfo(
  trx: TrxOrDb,
  health_worker_id: number,
  facility_id: number,
): Promise<EmploymentInfo[]> {
  const query = trx
    .selectFrom('facilities')
    .innerJoin('employment', 'employment.facility_id', 'facilities.id')
    .innerJoin(
      'health_workers',
      'health_worker_id',
      'employment.health_worker_id',
    )
    .where('health_workers.id', '=', health_worker_id)
    .where('facilities.id', '=', facility_id)
    .innerJoin(
      'employment as all_employment',
      'all_employment.health_worker_id',
      'health_workers.id',
    )
    .innerJoin(
      'facilities as all_facilities',
      'all_employment.facility_id',
      'all_facilities.id',
    )
    .leftJoin(
      'nurse_registration_details',
      'nurse_registration_details.health_worker_id',
      'health_workers.id',
    )
    .leftJoin(
      'nurse_specialities',
      'nurse_specialities.employee_id',
      'all_employment.health_worker_id',
    )
    .innerJoin(
      'nurse_specialities',
      'nurse_specialities.employee_id',
      'employment.health_worker_id',
    ) // will uncomment once specialties table is filled out
    .select([
      'nurse_registration_details.health_worker_id as health_worker_id',
      'nurse_registration_details.date_of_first_practice as date_of_first_practice',
      'nurse_registration_details.gender',
      'nurse_registration_details.mobile_number',
      'nurse_registration_details.national_id',
      'nurse_registration_details.ncz_registration_number',
      'health_workers.email',
      'health_workers.name',
      'health_workers.avatar_url',
      'all_facilities.name as facility_name',
      'all_facilities.id as facility_id',
      'all_facilities.address',
      'all_employment.profession',
    ])
    .distinct()

  console.log(query.compile().sql)

  return await query.execute()
}
