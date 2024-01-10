import { DeleteResult, sql, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import {
  EmployedHealthWorker,
  EmployedHealthWorkerWithGoogleTokens,
  EmployeeInfo,
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
import { hasName } from '../../util/haveNames.ts'
import pick from '../../util/pick.ts'
import groupBy from '../../util/groupBy.ts'

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

export function updateName(
  trx: TrxOrDb,
  health_worker_id: number,
  name: string,
): Promise<UpdateResult[]> {
  return trx
    .updateTable('health_workers')
    .set({ name })
    .where('id', '=', health_worker_id)
    .execute()
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
): Promise<Maybe<EmployedHealthWorkerWithGoogleTokens>> {
  const healthWorker = await get(trx, { email })
  if (!healthWorker) return null
  await upsertGoogleTokens(trx, healthWorker.id, tokens)
  return {
    ...healthWorker,
    ...tokens,
  }
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
      sql<Date>`now() + (5 * interval '1 minute')`,
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

// TODO: limit to approved nurses & doctors
export async function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    facility_id?: Maybe<number>
    professions?: Maybe<Profession[]>
    prioritize_facility_id?: Maybe<number>
  },
): Promise<ReturnedSqlRow<
  HealthWorker & {
    name: string
    facilities: {
      facility_id: number
      facility_name: string
      professions: Profession[]
    }[]
    description: string[]
  }
>[]> {
  let query = trx
    .selectFrom('health_workers')
    .innerJoin(
      'employment',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'facilities',
      'employment.facility_id',
      'facilities.id',
    )
    .select((eb) => [
      'health_workers.id',
      'health_workers.avatar_url',
      'health_workers.created_at',
      'health_workers.email',
      'health_workers.gcal_appointments_calendar_id',
      'health_workers.gcal_availability_calendar_id',
      'health_workers.name',
      'health_workers.updated_at',
      jsonArrayFrom(
        eb.selectFrom('employment')
          .innerJoin(
            'facilities',
            'employment.facility_id',
            'facilities.id',
          )
          .select([
            'employment.facility_id',
            'facilities.name as facility_name',
            sql<Profession[]>`JSON_AGG(employment.profession)`.as(
              'professions',
            ),
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          )
          .where(
            opts.facility_id
              ? sql<boolean>`employment.facility_id = ${opts.facility_id}`
              : sql<boolean>`TRUE`,
          )
          .groupBy([
            'employment.facility_id',
            'facilities.name',
          ]),
      ).as('facilities'),
    ])
    .where('health_workers.name', 'is not', null)
    .groupBy('health_workers.id')
    .limit(20)

  if (opts.search) {
    query = query.where('health_workers.name', 'ilike', `%${opts.search}%`)
  }
  if (opts.professions) {
    query = query
      .where('profession', 'in', opts.professions)
  }
  if (opts.facility_id) {
    query = query.where('employment.facility_id', '=', opts.facility_id)
  }
  if (opts.prioritize_facility_id) {
    query = query
      .orderBy(
        sql<
          boolean
        >`ARRAY_AGG(distinct employment.facility_id) @> ARRAY[${opts.prioritize_facility_id}::integer]`,
        'desc',
      )
  }

  const healthWorkers = await query.execute()

  return healthWorkers.map((hw) => {
    assert(hasName(hw))
    return {
      ...hw,
      description: hw.facilities.map(({ professions, facility_name }) =>
        `${professions.join(', ')} @ ${facility_name}`
      ),
    }
  })
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
    .leftJoin(
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
          .innerJoin(
            'facilities',
            'employment.facility_id',
            'facilities.id',
          )
          .select([
            'employment.facility_id',
            'facilities.name as facility_name',
            'employment.id as employment_id',
            'employment.profession',
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          ),
      ).as('employment'),
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
  if (!result) return null

  const employment_by_facility = groupBy(
    result.employment,
    (e) => e.facility_id,
  )

  return {
    id: result.id,
    created_at: result.created_at,
    updated_at: result.updated_at,
    ...pickHealthWorkerDetails(result),
    ...pickTokens(result),
    employment: [...employment_by_facility.entries()].map(
      ([facility_id, roles]) => {
        const nurse_role = roles.find((r) => r.profession === 'nurse') || null
        const doctor_role = roles.find((r) => r.profession === 'doctor') || null
        const admin_role = roles.find((r) => r.profession === 'admin') || null
        assert(nurse_role || doctor_role || admin_role)
        if (nurse_role) assert(!doctor_role)
        if (doctor_role) assert(!nurse_role)

        return {
          facility_id,
          facility_name: roles[0].facility_name,
          roles: {
            nurse: nurse_role && {
              registration_needed: !result.health_worker_id,
              registration_completed: !!result.approved_by,
              registration_pending_approval: !result.approved_by,
              employment_id: nurse_role.employment_id,
            },
            doctor: doctor_role && {
              registration_needed: false,
              registration_completed: true,
              registration_pending_approval: false,
              employment_id: doctor_role.employment_id,
            },
            admin: admin_role && {
              registration_needed: false,
              registration_completed: true,
              registration_pending_approval: false,
              employment_id: admin_role.employment_id,
            },
          },
        }
      },
    ),
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

export function getEmployeeInfo(
  trx: TrxOrDb,
  health_worker_id: number,
  facility_id: number,
): Promise<Maybe<EmployeeInfo>> {
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
      'nurse_specialties',
      'nurse_specialties.employee_id',
      'all_employment.id',
    )
    .leftJoin(
      (eb) =>
        eb
          .selectFrom('address')
          .leftJoin('suburbs', 'suburbs.id', 'address.suburb_id')
          .leftJoin('wards', 'wards.id', 'address.ward_id')
          .leftJoin('districts', 'districts.id', 'address.district_id')
          .leftJoin('provinces', 'provinces.id', 'address.province_id')
          .leftJoin('countries', 'countries.id', 'address.country_id')
          .select([
            'address.id',
            sql<
              string
            >`CONCAT_WS(', ', address.street, suburbs.name, wards.name, districts.name, provinces.name, countries.name)`
              .as('address'),
          ])
          .as('address_subquery'),
      (join) =>
        join
          .onRef(
            'address_subquery.id',
            '=',
            'nurse_registration_details.address_id',
          ),
    )
    .select((eb) => [
      'all_employment.health_worker_id as health_worker_id',
      sql<
        Maybe<string>
      >`TO_CHAR(nurse_registration_details.date_of_birth, 'FMDD FMMonth YYYY')`
        .as('date_of_birth'),
      sql<
        Maybe<string>
      >`TO_CHAR(nurse_registration_details.date_of_first_practice, 'FMDD FMMonth YYYY')`
        .as('date_of_first_practice'),
      'nurse_registration_details.gender',
      'nurse_registration_details.mobile_number',
      'nurse_registration_details.national_id_number',
      'nurse_registration_details.ncz_registration_number',
      'nurse_specialties.specialty',
      'health_workers.email',
      'health_workers.name',
      'health_workers.avatar_url',
      'address_subquery.address',
      ({ eb, and }) =>
        and([
          eb('nurse_registration_details.id', 'is not', null),
          eb('nurse_registration_details.approved_by', 'is', null),
        ]).as('registration_pending_approval'),
      ({ eb, and }) =>
        and([
          eb('nurse_registration_details.id', 'is', null),
          eb('employment.profession', '=', 'nurse'),
        ]).as('registration_needed'),
      ({ eb, or }) =>
        or([
          eb('employment.profession', '!=', 'nurse'),
          eb('nurse_registration_details.approved_by', 'is not', null),
        ]).as('registration_completed'),
      jsonArrayFrom(
        eb.selectFrom('facilities')
          .innerJoin('employment', 'employment.facility_id', 'facilities.id')
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'employment.health_worker_id',
          )
          .where('health_workers.id', '=', health_worker_id)
          .groupBy(['facilities.id', 'facilities.name'])
          .select([
            'facilities.id as facility_id',
            'facilities.name as facility_name',
            'facilities.address',
            sql<Profession[]>`array_agg(employment.profession)`.as(
              'professions',
            ),
          ]),
      ).as('employment'),
      jsonArrayFrom(
        eb.selectFrom('nurse_registration_details as nd_1').whereRef(
          'nd_1.id',
          '=',
          'nurse_registration_details.id',
        ).where(
          'nurse_registration_details.national_id_media_id',
          'is not',
          null,
        )
          .select([
            sql<string>`'National ID'`.as('name'),
            sql<
              string
            >`concat('/app/facilities/', facilities.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.national_id_media_id::text)`
              .as('href'),
          ])
          .union(
            eb.selectFrom('nurse_registration_details as nd_1').whereRef(
              'nd_1.id',
              '=',
              'nurse_registration_details.id',
            ).where(
              'nurse_registration_details.face_picture_media_id',
              'is not',
              null,
            )
              .select([
                sql<string>`'Face Picture'`.as('name'),
                sql<
                  string
                >`concat('/app/facilities/', facilities.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.face_picture_media_id::text)`
                  .as('href'),
              ]),
          )
          .union(
            eb.selectFrom('nurse_registration_details as nd_1').whereRef(
              'nd_1.id',
              '=',
              'nurse_registration_details.id',
            ).where(
              'nurse_registration_details.ncz_registration_card_media_id',
              'is not',
              null,
            )
              .select([
                sql<string>`'Registration Card'`.as('name'),
                sql<
                  string
                >`concat('/app/facilities/', facilities.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.ncz_registration_card_media_id::text)`
                  .as('href'),
              ]),
          )
          .union(
            eb.selectFrom('nurse_registration_details as nd_1').whereRef(
              'nd_1.id',
              '=',
              'nurse_registration_details.id',
            ).where(
              'nurse_registration_details.nurse_practicing_cert_media_id',
              'is not',
              null,
            )
              .select([
                sql<string>`'Nurse Practicing Certificate'`.as('name'),
                sql<
                  string
                >`concat('/app/facilities/', facilities.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.nurse_practicing_cert_media_id::text)`
                  .as('href'),
              ]),
          )
          .orderBy('name'),
      ).as('documents'),
    ])

  return query.executeTakeFirst()
}
