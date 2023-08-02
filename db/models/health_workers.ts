import { DeleteResult, sql, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import {
  Employee,
  Facility,
  GoogleTokens,
  HealthWorker,
  HealthWorkerInvitee,
  HealthWorkerWithGoogleTokens,
  Maybe,
  NurseRegistrationDetails,
  NurseSpeciality,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import haveNames from '../../util/haveNames.ts'

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

export async function isAdmin(
  trx: TrxOrDb,
  opts: {
    employee_id: number
    facility_id: number
  },
): Promise<boolean> {
  const matches = await trx
    .selectFrom('employment')
    .where('health_worker_id', '=', opts.employee_id)
    .where('facility_id', '=', opts.facility_id)
    .where('profession', '=', 'admin')
    .execute()
  if (matches.length > 1) {
    throw new Error(
      'Duplicate matches found when searching for an admin identified by: ' +
        opts.employee_id + ' in database',
    )
  }
  return matches.length === 1
}

export async function getFirstEmployedFacility(
  trx: TrxOrDb,
  opts: {
    employeeId: number
  },
): Promise<number | undefined> {
  const firstFacility = await trx
    .selectFrom('employment')
    .select('facility_id')
    .where('health_worker_id', '=', opts.employeeId)
    .orderBy('id')
    .executeTakeFirstOrThrow()

  return firstFacility.facility_id
}

export async function getEmployee(
  trx: TrxOrDb,
  opts: {
    facilityId: number
    healthworkerId: number
  },
) {
  return await trx
    .selectFrom('employment')
    .selectAll()
    .where('facility_id', '=', opts.facilityId)
    .where('health_worker_id', '=', opts.healthworkerId)
    .executeTakeFirst()
}

export async function getEmployeesAtFacility(
  trx: TrxOrDb,
  opts: {
    facilityId: number
  },
): Promise<ReturnedSqlRow<
  {
    id: number
    name: string
    profession: Profession
    avatar_url: string
  }
>[]> {
  return await trx
    .selectFrom('employment')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'facilities',
      'facilities.id',
      'employment.facility_id',
    )
    .where('facility_id', '=', opts.facilityId)
    .select([
      'health_workers.name as name',
      'profession',
      'health_workers.id as id',
      'health_workers.created_at',
      'health_workers.updated_at',
      'avatar_url',
    ])
    .execute()
}

export function getFacilityById(
  trx: TrxOrDb,
  opts: {
    facilityId: number
  },
): Promise<Maybe<ReturnedSqlRow<Facility>>> {
  return trx
    .selectFrom('facilities')
    .where('id', '=', opts.facilityId)
    .selectAll()
    .executeTakeFirst()
}

export async function addToInvitees(
  trx: TrxOrDb,
  invite: {
    email: string
    facility_id: number
    profession: Profession
    invite_code: string
  },
) {
  return await trx
    .insertInto('health_worker_invitees')
    .values(invite)
    .returningAll()
    .executeTakeFirst()
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

export function getInvitee(
  trx: TrxOrDb,
  opts: {
    inviteCode?: string
    email: string
  },
): Promise<Maybe<ReturnedSqlRow<HealthWorkerInvitee>>> {
  let query = trx
    .selectFrom('health_worker_invitees')
    .where('email', '=', opts.email)
    .selectAll()

  if (opts.inviteCode) query = query.where('invite_code', '=', opts.inviteCode)

  return query.executeTakeFirst()
}

export async function isHealthWorker(
  trx: TrxOrDb,
  email: string,
): Promise<boolean> {
  const matches = await trx
    .selectFrom('health_workers')
    .where('email', '=', email)
    .selectAll()
    .execute()
  return matches.length >= 1
}

export async function getInviteCode(
  trx: TrxOrDb,
  email: string,
): Promise<string> {
  const result = await trx
    .selectFrom('health_worker_invitees')
    .where('email', '=', email)
    .select('invite_code')
    .executeTakeFirstOrThrow()
  return result.invite_code
}

export async function addEmployee(
  trx: TrxOrDb,
  opts: {
    employee: Employee
  },
): Promise<ReturnedSqlRow<Employee> | undefined> {
  return await trx
    .insertInto('employment')
    .values(opts.employee)
    .returningAll()
    .executeTakeFirst()
}

export async function addNurseSpeciality(
  trx: TrxOrDb,
  opts: {
    employeeId: number
    speciality: NurseSpeciality
  },
) {
  return await trx
    .insertInto('nurse_specialities')
    .values({
      employee_id: opts.employeeId,
      speciality: opts.speciality,
    })
    .execute()
}

export async function addNurseRegistrationDetails(
  trx: TrxOrDb,
  opts: {
    registrationDetails: NurseRegistrationDetails
  },
) {
  console.log(opts.registrationDetails)
  return await trx
    .insertInto('nurse_registration_details')
    .values(opts.registrationDetails)
    .execute()
}
