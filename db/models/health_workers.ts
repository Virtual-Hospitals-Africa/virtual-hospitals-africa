import { DeleteResult, sql, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import {
  EmployedHealthWorker,
  EmployeeInfo,
  GoogleTokens,
  HasId,
  HealthWorker,
  HealthWorkerWithGoogleTokens,
  Maybe,
  PossiblyEmployedHealthWorker,
  TrxOrDb,
} from '../../types.ts'
import {
  jsonArrayFrom,
  jsonArrayFromColumn,
  jsonBuildObject,
} from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import pick from '../../util/pick.ts'
import groupBy from '../../util/groupBy.ts'
import * as patient_encounters from './patient_encounters.ts'
import * as doctor_reviews from './doctor_reviews.ts'
import * as address from './address.ts'
import { assertOr401 } from '../../util/assertOr.ts'

// Shave a minute so that we refresh too early rather than too late
const expiresInAnHourSql = sql<
  Date
>`(SELECT now() + (59 * interval '1 minute'))`

export function upsert(
  trx: TrxOrDb,
  details: HealthWorker,
): Promise<HasId<HealthWorker>> {
  return trx
    .insertInto('health_workers')
    .values(details)
    .onConflict((oc) => oc.column('email').doUpdateSet(details))
    .returning(['id', 'name', 'email', 'avatar_url'])
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
): Promise<HasId<GoogleTokens> | undefined> {
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

export const getWithTokensQuery = (trx: TrxOrDb) =>
  trx
    .selectFrom('health_workers')
    .innerJoin(
      'health_worker_google_tokens',
      'health_workers.id',
      'health_worker_google_tokens.health_worker_id',
    )
    .select([
      'avatar_url',
      'email',
      'name',
      'access_token',
      'refresh_token',
      'expires_at',
    ])

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
    'email' in health_worker && typeof health_worker.email === 'string'
}

export function isEmployed(
  health_worker: unknown,
): health_worker is EmployedHealthWorker {
  return isHealthWorkerWithGoogleTokens(health_worker) &&
    'employment' in health_worker &&
    Array.isArray(health_worker.employment) &&
    !!health_worker.employment.length &&
    'default_organization_id' in health_worker &&
    typeof health_worker.default_organization_id === 'number'
}

export function allWithGoogleTokensAboutToExpire(trx: TrxOrDb): Promise<
  HealthWorkerWithGoogleTokens[]
> {
  return getWithTokensQuery(trx).select('id').where(
    'health_worker_google_tokens.expires_at',
    '<',
    sql<Date>`now() + (5 * interval '1 minute')`,
  ).execute()
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

export async function get(
  trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: number },
): Promise<Maybe<PossiblyEmployedHealthWorker>> {
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
      'health_workers.name',
      'health_workers.email',
      'health_workers.avatar_url',
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
            'organizations',
            'employment.organization_id',
            'organizations.id',
          )
          .innerJoin(
            'provider_calendars',
            (join) =>
              join
                .onRef(
                  'employment.organization_id',
                  '=',
                  'provider_calendars.organization_id',
                )
                .onRef(
                  'employment.health_worker_id',
                  '=',
                  'provider_calendars.health_worker_id',
                ),
          )
          .select((eb_employment) => [
            'employment.id as employment_id',
            'employment.profession',
            'provider_calendars.gcal_appointments_calendar_id',
            'provider_calendars.gcal_availability_calendar_id',
            'provider_calendars.availability_set',
            jsonBuildObject({
              id: eb_employment.ref('employment.organization_id'),
              name: eb_employment.ref('organizations.name'),
              address: eb_employment.ref('organizations.address'),
            }).as('organization'),
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
      jsonBuildObject({
        requested: jsonArrayFrom(
          doctor_reviews.requestsOfHealthWorker(trx, health_worker_id),
        ),
        in_progress: jsonArrayFrom(
          doctor_reviews.ofHealthWorker(trx, health_worker_id),
        ),
      }).as('reviews'),
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
    ...health_worker
  } = result
  assertOr401(access_token)
  assertOr401(refresh_token)
  assertOr401(expires_at)

  const employment_by_organization = groupBy(
    result.employment,
    (e) => e.organization.id,
  )
  const employment = [...employment_by_organization.values()].map(
    (roles) => {
      const nurse_role = roles.find((r) => r.profession === 'nurse') || null
      const doctor_role = roles.find((r) => r.profession === 'doctor') || null
      const admin_role = roles.find((r) => r.profession === 'admin') || null
      assert(nurse_role || doctor_role || admin_role)
      if (nurse_role) assert(!doctor_role)
      if (doctor_role) assert(!nurse_role)

      return {
        organization: roles[0].organization,
        gcal_appointments_calendar_id: roles[0].gcal_appointments_calendar_id,
        gcal_availability_calendar_id: roles[0].gcal_availability_calendar_id,
        availability_set: roles[0].availability_set,
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
  )

  return {
    ...health_worker,
    access_token,
    refresh_token,
    expires_at,
    employment,
    default_organization_id: employment[0]?.organization.id ?? null,
  }
}

export async function getEmployed(
  trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: number },
): Promise<EmployedHealthWorker> {
  const health_worker = await get(trx, { health_worker_id })
  assert(health_worker)
  assert(isEmployed(health_worker))
  return health_worker
}

export async function getInviteesAtFacility(
  trx: TrxOrDb,
  organizationId: number,
) {
  return await trx
    .selectFrom('health_worker_invitees')
    .where('organization_id', '=', organizationId)
    .select([
      'id',
      'email',
      'profession',
    ])
    .execute()
}

export function getEmployeeInfo(
  trx: TrxOrDb,
  opts: {
    health_worker_id: number
    organization_id: number
  },
): Promise<Maybe<EmployeeInfo>> {
  return trx.with('health_worker_at_organization', (qb) =>
    qb
      .selectFrom('employment')
      .where('employment.health_worker_id', '=', opts.health_worker_id)
      .where('employment.organization_id', '=', opts.organization_id)
      .select('health_worker_id')
      .distinct()).with('employee_info', (qb) =>
      qb
        .selectFrom('health_worker_at_organization')
        .innerJoin(
          'health_workers',
          'health_workers.id',
          'health_worker_at_organization.health_worker_id',
        )
        .innerJoin(
          'organizations',
          (join) => join.on('organizations.id', '=', opts.organization_id),
        )
        .leftJoin(
          'employment as nurse_employment',
          (join) =>
            join
              .onRef(
                'nurse_employment.health_worker_id',
                '=',
                'health_workers.id',
              )
              .on('nurse_employment.profession', '=', 'nurse')
              .on('nurse_employment.organization_id', '=', opts.organization_id),
        )
        .leftJoin(
          'nurse_specialties',
          'nurse_specialties.employee_id',
          'nurse_employment.id',
        )
        .leftJoin(
          'nurse_registration_details',
          'nurse_registration_details.health_worker_id',
          'health_workers.id',
        )
        .leftJoin(
          address.formatted(trx),
          'address_formatted.id',
          'nurse_registration_details.address_id',
        )
        .select((eb) => [
          'health_workers.id as health_worker_id',
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
          'organizations.id as organization_id',
          'organizations.name as organization_name',
          'organizations.address as organization_address',
          jsonArrayFromColumn(
            'profession',
            eb
              .selectFrom('employment')
              .where(
                'health_worker_id',
                '=',
                opts.health_worker_id,
              )
              .where('organization_id', '=', opts.organization_id)
              .select(['employment.profession']),
          ).as('professions'),
          ({ eb, and }) =>
            and([
              eb('nurse_employment.id', 'is not', null),
              eb('nurse_registration_details.id', 'is not', null),
              eb('nurse_registration_details.approved_by', 'is', null),
            ]).as('registration_pending_approval'),
          ({ eb, and }) =>
            and([
              eb('nurse_employment.id', 'is not', null),
              eb('nurse_registration_details.id', 'is', null),
            ]).as('registration_needed'),
          ({ eb, or }) =>
            or([
              eb('nurse_employment.id', 'is', null),
              eb('nurse_registration_details.approved_by', 'is not', null),
            ]).as('registration_completed'),
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
                >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.national_id_media_id::text)`
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
                    >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.face_picture_media_id::text)`
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
                    >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.ncz_registration_card_media_id::text)`
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
                    >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.nurse_practicing_cert_media_id::text)`
                      .as('href'),
                  ]),
              )
              .orderBy('name'),
          ).as('documents'),
        ]))
    .selectFrom('employee_info')
    .selectAll()
    .executeTakeFirst()
}
