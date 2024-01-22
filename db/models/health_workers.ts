import { DeleteResult, sql, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import {
  EmployedHealthWorker,
  EmployeeInfo,
  GoogleTokens,
  HealthWorker,
  HealthWorkerWithGoogleTokens,
  Maybe,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import { hasName } from '../../util/haveNames.ts'
import pick from '../../util/pick.ts'
import groupBy from '../../util/groupBy.ts'
import * as patient_encounters from './patient_encounters.ts'
import * as address from './address.ts'
import { assertOr401 } from '../../util/assertOr.ts'
import sortBy from '../../util/sortBy.ts'

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
): Promise<null | { id: number }> {
  const healthWorker = await trx.selectFrom('health_workers').where(
    'email',
    '=',
    email,
  ).select('id').executeTakeFirst()
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
): health_worker is EmployedHealthWorker {
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

  const healthWorkers = await query.execute()

  const results_with_description = healthWorkers.map((hw) => {
    assert(hasName(hw))
    return {
      ...hw,
      description: hw.facilities.map(({ professions, facility_name }) =>
        `${professions.join(', ')} @ ${facility_name}`
      ),
    }
  })

  if (!opts.prioritize_facility_id) return results_with_description

  return sortBy(
    results_with_description,
    (hw) =>
      hw.facilities.some((facility) =>
          facility.facility_id === opts.prioritize_facility_id
        )
        ? 0
        : 1,
  )
}

export async function get(
  trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: number },
): Promise<Maybe<EmployedHealthWorker>> {
  const result = await trx
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
      eb('nurse_registration_details.health_worker_id', 'is', null).as(
        'registration_needed',
      ),
      'nurse_registration_details.approved_by',
      jsonArrayFrom(
        eb.selectFrom('employment')
          .innerJoin(
            'facilities',
            'employment.facility_id',
            'facilities.id',
          )
          .select((eb_employment) => [
            'employment.id as employment_id',
            'employment.profession',
            jsonBuildObject({
              id: eb_employment.ref('employment.facility_id'),
              name: eb_employment.ref('facilities.name'),
              address: eb_employment.ref('facilities.address'),
            }).as('facility'),
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          ),
      ).as('employment'),
      jsonArrayFrom(
        patient_encounters.baseQuery(trx)
          .where('patient_encounters.closed_at', 'is', null)
          .where(
            'patient_encounters.id',
            'in',
            patient_encounters.ofHealthWorker(trx, health_worker_id),
          ),
      ).as('open_encounters'),
    ]).where(
      'health_workers.id',
      '=',
      health_worker_id,
    ).executeTakeFirst()

  if (!result) return null
  const {
    access_token,
    refresh_token,
    expires_at,
    registration_needed,
    approved_by,
    employment,
    ...health_worker
  } = result
  assertOr401(access_token)
  assertOr401(refresh_token)
  assertOr401(expires_at)

  const employment_by_facility = groupBy(
    employment,
    (e) => e.facility.id,
  )

  return {
    ...health_worker,
    access_token,
    refresh_token,
    expires_at,
    employment: [...employment_by_facility.values()].map(
      (roles) => {
        const nurse_role = roles.find((r) => r.profession === 'nurse') || null
        const doctor_role = roles.find((r) => r.profession === 'doctor') || null
        const admin_role = roles.find((r) => r.profession === 'admin') || null
        assert(nurse_role || doctor_role || admin_role)
        if (nurse_role) assert(!doctor_role)
        if (doctor_role) assert(!nurse_role)

        return {
          facility: roles[0].facility,
          roles: {
            nurse: nurse_role && {
              registration_needed: !!registration_needed,
              registration_completed: !!approved_by,
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
      address.formatted(trx),
      'address_formatted.id',
      'nurse_registration_details.address_id',
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
      'address_formatted.address',
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
