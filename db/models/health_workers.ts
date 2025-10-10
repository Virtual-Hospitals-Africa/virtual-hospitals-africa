import { DeleteResult, sql, UpdateResult } from 'kysely'
import isDate from '../../util/isDate.ts'
import {
  EmployedHealthWorker,
  EmployeeInfo,
  GoogleTokens,
  HasStringId,
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
  now,
} from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import pick from '../../util/pick.ts'
import { groupBy } from '../../util/groupBy.ts'
import * as patient_encounters from './patient_encounters.ts'
import * as doctor_reviews from './doctor_reviews.ts'
import * as google_tokens from './google_tokens.ts'
import { assertOr401 } from '../../util/assertOr.ts'
import { combine } from '../../util/combine.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import first from '../../util/first.ts'
import { assertDepartmentName } from '../../shared/departments.ts'
import { assertAll } from '../../util/assertAll.ts'
import { HealthWorkerIdSelection } from './health_worker_id.ts'

export function upsert(
  trx: TrxOrDb,
  details: HealthWorker,
): Promise<HasStringId<HealthWorker>> {
  return trx
    .insertInto('health_workers')
    .values(details)
    .onConflict((oc) => oc.column('email').doUpdateSet(details))
    .returning(['id', 'name', 'email', 'avatar_url'])
    .executeTakeFirstOrThrow()
}

export function updateName(
  trx: TrxOrDb,
  health_worker_id: string,
  name: string,
): Promise<UpdateResult[]> {
  return trx
    .updateTable('health_workers')
    .set({ name })
    .where('id', '=', health_worker_id)
    .execute()
}

export const pickTokens = pick(['access_token', 'refresh_token', 'expires_at'])

export function updateTokens(
  trx: TrxOrDb,
  email: string,
  tokens: GoogleTokens,
): Promise<null | { id: string }> {
  return google_tokens.updateTokensByEmail(trx, 'health_worker', email, tokens)
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
  await google_tokens.upsert(
    trx,
    'health_worker',
    health_worker.id,
    tokens,
  )
  return combine(health_worker, tokens)
}

export const getWithTokensQuery = (trx: TrxOrDb) =>
  trx
    .selectFrom('health_workers')
    .innerJoin(
      'google_tokens',
      (join) =>
        join
          .onRef('health_workers.id', '=', 'google_tokens.entity_id')
          .on('google_tokens.entity_type', '=', 'health_worker'),
    )
    .select([
      'health_workers.id',
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
    'id' in health_worker && typeof health_worker.id === 'string' &&
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
    typeof health_worker.default_organization_id === 'string'
}

export function updateAccessToken(
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
}

export function removeExpiredAccessToken(
  trx: TrxOrDb,
  opts: { health_worker_id: string },
): Promise<DeleteResult> {
  return google_tokens.removeExpiredAccessToken(
    trx,
    'health_worker',
    opts.health_worker_id,
  )
}

// TODO: See if we can do the update and get in a single query
export async function getBySession(trx: TrxOrDb, { session_id }: {
  session_id: string
}): Promise<Maybe<PossiblyEmployedHealthWorker>> {
  const session = await trx.updateTable('sessions').where(
    'id',
    '=',
    session_id,
  )
    .where('entity_type', '=', 'health_worker')
    .set({ updated_at: now })
    .returning('entity_id')
    .executeTakeFirst()

  return session && get(trx, {
    health_worker_id: session.entity_id,
  })
}

function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('health_workers')
    .leftJoin(
      'nurse_registration_details',
      'health_workers.id',
      'nurse_registration_details.health_worker_id',
    )
    .leftJoin(
      'sessions',
      (join) =>
        join
          .onRef('health_workers.id', '=', 'sessions.entity_id')
          .on('sessions.entity_type', '=', 'health_worker'),
    )
    .leftJoin(
      'google_tokens',
      (join) =>
        join
          .onRef('health_workers.id', '=', 'google_tokens.entity_id')
          .on('google_tokens.entity_type', '=', 'health_worker'),
    )
    .select((eb) => [
      'health_workers.id',
      'health_workers.name',
      'health_workers.email',
      'health_workers.avatar_url',
      'google_tokens.access_token',
      'google_tokens.refresh_token',
      'google_tokens.expires_at',
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
          .leftJoin(
            'addresses as organization_address',
            'organizations.address_id',
            'organization_address.id',
          )
          .leftJoin(
            'health_worker_organization_calendars',
            (join) =>
              join
                .onRef(
                  'employment.organization_id',
                  '=',
                  'health_worker_organization_calendars.organization_id',
                )
                .onRef(
                  'employment.health_worker_id',
                  '=',
                  'health_worker_organization_calendars.health_worker_id',
                ),
          )
          .select((eb_employment) => [
            'employment.id as employment_id',
            'employment.profession',
            'health_worker_organization_calendars.gcal_appointments_calendar_id',
            'health_worker_organization_calendars.gcal_availability_calendar_id',
            'health_worker_organization_calendars.availability_set',
            jsonBuildObject({
              id: eb_employment.ref('employment.organization_id'),
              name: eb_employment.ref('organizations.name'),
              address: eb_employment.ref('organization_address.formatted'),
            }).as('organization'),
            jsonArrayFrom(
              eb_employment.selectFrom('department_employment')
                .innerJoin(
                  'organization_departments',
                  'organization_departments.id',
                  'department_employment.department_id',
                )
                .whereRef(
                  'department_employment.employment_id',
                  '=',
                  'employment.id',
                )
                .select([
                  'organization_departments.id',
                  'organization_departments.name',
                ]),
            ).as('departments'),
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          ),
      ).as('employment'),
    ])
}

export async function get(
  trx: TrxOrDb,
  { health_worker_id }: {
    health_worker_id: string | HealthWorkerIdSelection
  },
): Promise<Maybe<PossiblyEmployedHealthWorker>> {
  const {
    health_worker_with_tokens,
    present_encounter = null,
    doctor_reviews_in_progress,
    doctor_reviews_requested,
  } = await promiseProps({
    health_worker_with_tokens: baseQuery(trx).where(
      'health_workers.id',
      '=',
      health_worker_id,
    ).executeTakeFirst(),
    present_encounter: patient_encounters.getOpen(trx, {
      presence_health_worker_id: health_worker_id,
    }).then(first),
    doctor_reviews_in_progress: doctor_reviews.ofHealthWorker(
      trx,
      health_worker_id,
    ).execute(),
    doctor_reviews_requested: doctor_reviews.requestsOfHealthWorker(
      trx,
      health_worker_id,
    ).execute(),
  })

  if (!health_worker_with_tokens) return null

  const {
    access_token,
    refresh_token,
    expires_at,
    registration_needed,
    approved_by,
    ...health_worker
  } = health_worker_with_tokens
  assertOr401(access_token)
  assertOr401(refresh_token)
  assertOr401(expires_at)

  const employment_by_organization = groupBy(
    health_worker.employment,
    (e) => e.organization.id,
  )
  const employment = [...employment_by_organization.values()].map(
    (roles) => {
      const nurse_role = roles.find((r) => r.profession === 'nurse') || null
      const doctor_role = roles.find((r) => r.profession === 'doctor') || null
      const admin_role = roles.find((r) => r.profession === 'admin') || null
      const receptionist_role =
        roles.find((r) => r.profession === 'receptionist') || null
      assert(nurse_role || doctor_role || admin_role || receptionist_role)
      if (nurse_role) {
        assert(!doctor_role)
        assert(!receptionist_role)
      }
      if (doctor_role) {
        assert(!nurse_role)
        assert(!receptionist_role)
      }
      if (receptionist_role) {
        assert(!doctor_role)
        assert(!nurse_role)
      }

      const provider_id = nurse_role?.employment_id ||
        doctor_role?.employment_id || null

      const {
        organization,
        gcal_appointments_calendar_id,
        gcal_availability_calendar_id,
        availability_set,
        departments,
      } = roles[0]
      assertAll(departments, assertDepartmentName)

      return {
        organization,
        gcal_appointments_calendar_id,
        gcal_availability_calendar_id,
        availability_set,
        departments,
        provider_id,
        non_admin_id: provider_id || receptionist_role?.employment_id || null,
        roles: {
          nurse: nurse_role && {
            registration_needed: !!registration_needed,
            registration_completed: !!approved_by,
            registration_pending_approval: !approved_by,
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
          receptionist: receptionist_role && {
            registration_needed: false,
            registration_completed: true,
            registration_pending_approval: false,
            employment_id: receptionist_role.employment_id,
          },
        },
      }
    },
  )

  return {
    ...health_worker,
    present_encounter,
    access_token,
    refresh_token,
    expires_at,
    employment,
    default_organization_id: employment[0]?.organization.id ?? null,
    reviews: {
      in_progress: doctor_reviews_in_progress,
      requested: doctor_reviews_requested,
    },
  }
}

export async function getEmployed(
  trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: string | HealthWorkerIdSelection },
): Promise<EmployedHealthWorker> {
  const health_worker = await get(trx, { health_worker_id })
  assert(health_worker)
  assert(isEmployed(health_worker))
  return health_worker
}

export function getEmployeeInfo(
  trx: TrxOrDb,
  opts: {
    health_worker_id: string
    organization_id: string
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
          'addresses as organization_address',
          'organizations.address_id',
          'organization_address.id',
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
              .on(
                'nurse_employment.organization_id',
                '=',
                opts.organization_id,
              ),
        )
        .leftJoin(
          'nurse_registration_details',
          'nurse_registration_details.health_worker_id',
          'health_workers.id',
        )
        .leftJoin(
          'addresses',
          'addresses.id',
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
          'nurse_employment.specialty',
          'health_workers.email',
          'health_workers.name',
          'health_workers.avatar_url',
          'addresses.formatted as address',
          'organizations.id as organization_id',
          'organizations.name as organization_name',
          'organization_address.formatted as organization_address',
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

export function removeById(
  trx: TrxOrDb,
  id: string,
) {
  return trx.deleteFrom('health_workers').where('id', '=', id)
    .executeTakeFirstOrThrow()
}
