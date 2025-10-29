import { assert } from 'std/assert/assert.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import {
  HasStringId,
  InsertShape,
  Maybe,
  Patient,
  PatientNearestOrganization,
  PatientSchedulingAppointmentRequest,
  RenderedPatient,
  TrxOrDb,
} from '../../types.ts'
import { haveNames } from '../../util/haveNames.ts'
import { getWalkingDistance } from '../../external-clients/google-maps.ts'
import * as conversations from './conversations.ts'
import * as nearest_organizations from './nearest_organizations.ts'
import {
  jsonBuildNullableObject,
  jsonBuildObject,
  jsonObjectFrom,
  literalLocation,
  longFormattedDate,
} from '../helpers.ts'
import { DB, Patients } from '../../db.d.ts'
import { assertFoundEventually } from '../../util/assertEventually.ts'
import { pMap } from '../../util/inParallel.ts'
import { base } from './_base.ts'
import last from '../../util/last.ts'
import { exists } from '../../util/exists.ts'
import first from '../../util/first.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

export const view_href_sql = sql<string>`
  concat('/app/patients/', patients.id::text)
`

export const avatar_url_sql = sql<string | null>`
  CASE WHEN patients.avatar_media_id IS NOT NULL
    THEN concat('/app/patients/', patients.id::text, '/avatar')
    ELSE NULL
  END
`

export const description_sql = sql<string | null>`
  CASE 
    WHEN NOT patients.completed_registration THEN NULL
    WHEN (
      (patients.sex = 'female' AND patients.gender = 'woman') OR
      (patients.sex = 'male' AND patients.gender = 'man')
    ) THEN patients.sex || ' • ' || TO_CHAR(patients.date_of_birth, 'FMDD FMMonth YYYY') 
    ELSE patients.sex || ' • ' || patients.gender || ' • ' || TO_CHAR(patients.date_of_birth, 'FMDD FMMonth YYYY') 
  END
`

const dob_formatted = longFormattedDate('patients.date_of_birth').as(
  'dob_formatted',
)

const baseQuery = (trx: TrxOrDb) =>
  trx.selectFrom('patients')
    .leftJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .leftJoin(
      'addresses',
      'addresses.id',
      'patients.address_id',
    )
    .select((eb) => [
      'patients.id',
      eb.ref('patients.name').$notNull().as('name'),
      'patients.phone_number',
      'patients.sex',
      'patients.gender',
      'patients.ethnicity',
      'addresses.formatted as address',
      sql<null | string>`TO_CHAR(patients.date_of_birth, 'YYYY-MM-DD')`.as(
        'date_of_birth',
      ),
      dob_formatted,
      'patient_age.age_display',
      'patients.preferred_language_code_iso_639_2_b',
      sql<number | null>`patient_age.age_years::integer`.as('age_years'),
      description_sql.as('description'),
      'patients.national_id_number',
      'patients.completed_registration',
      avatar_url_sql.as('avatar_url'),
      sql<null>`NULL`.as('last_visited'),
      jsonBuildNullableObject(eb.ref('patients.location'), {
        longitude: sql<number>`ST_X(patients.location::geometry)`,
        latitude: sql<number>`ST_Y(patients.location::geometry)`,
      }).as('location'),
      jsonBuildObject({
        view: view_href_sql,
      }).as('actions'),
      jsonBuildNullableObject(eb.ref('patients.name'), {
        full: eb.ref('patients.name').$notNull(),
        first: eb.ref('patients.first_names').$notNull(),
        surname: eb.ref('patients.surname').$notNull(),
        preferred: eb.ref('patients.preferred_name').$notNull(),
      }).as('names'),
      jsonObjectFrom(
        eb.selectFrom('organizations as nearest_organizations')
          .whereRef(
            'nearest_organizations.id',
            '=',
            'patients.nearest_organization_id',
          )
          .select([
            'nearest_organizations.id',
            'nearest_organizations.name',
          ]),
      ).as('nearest_organization'),
      jsonObjectFrom(
        eb.selectFrom('employment')
          .innerJoin(
            'health_workers',
            'employment.health_worker_id',
            'health_workers.id',
          )
          .innerJoin(
            'organizations as primary_doctor_organizations',
            'employment.organization_id',
            'primary_doctor_organizations.id',
          )
          .whereRef(
            'employment.id',
            '=',
            'patients.primary_doctor_id',
          )
          .select((eb2) => [
            'employment.id as employment_id',
            'employment.health_worker_id',
            'health_workers.name',
            'health_workers.avatar_url',
            'employment.specialty',
            // TODO implement last_visit_relative_to_now
            sql<string>`'2 months ago'`.as('last_visit_relative_to_now'),
            jsonBuildObject({
              id: eb2.ref('primary_doctor_organizations.id'),
              name: eb2.ref('primary_doctor_organizations.name'),
            }).as('organization'),
          ]),
      ).as('primary_doctor'),
    ])
    .orderBy(
      'name asc',
    )

export async function getLastConversationState(
  trx: TrxOrDb,
  query: { phone_number: string },
) {
  const user = await assertFoundEventually(conversations.getUser(
    trx,
    'patient',
    {
      phone_number: query.phone_number,
    },
  ))
  assert(user.entity_id)
  return {
    patient_id: user.entity_id,
    chatbot_user_id: user.id,
    conversation_state: user.conversation_state,
  }
}

type PatientUpsert =
  & Partial<Patient>
  & {
    id?: string
  }
  & ({
    name: string
    first_names?: string
    surname?: string
    preferred_name?: string
  } | {
    name?: never
    first_names: string
    surname: string
    preferred_name: string
  })

function asPatientValues(
  {
    location,
    primary_doctor_id,
    name,
    first_names,
    surname,
    preferred_name,
    ...patient
  }: PatientUpsert,
): InsertShape<Patients> {
  if (first_names) {
    assert(surname)
    assert(preferred_name)
    if (name) {
      assertEquals(name, first_names + ' ' + surname)
    } else {
      name = first_names + ' ' + surname
    }
  } else {
    assert(name)
    assert(!surname)
    assert(!preferred_name)
    const names = name.split(' ')
    surname = exists(last(names))
    preferred_name = exists(first(names))
    first_names = names.slice(0, -1).join(' ')
  }

  return {
    ...patient,
    name,
    first_names,
    surname,
    preferred_name,
    primary_doctor_id,
    location: location && literalLocation(location),
  }
}

export function insertMany(
  trx: TrxOrDb,
  patients: Array<Partial<Patient> & { name: string }>,
) {
  assert(patients.length > 0, 'Must insert at least one patient')
  return trx
    .insertInto('patients')
    .values(patients.map(asPatientValues))
    .returningAll()
    .execute()
}

export async function insert(
  trx: TrxOrDb,
  { conversation_state, ...to_insert }: Partial<Patient> & {
    name: string
    conversation_state?: string
  },
) {
  const inserted = await insertMany(trx, [to_insert])
  assert(inserted.length === 1)
  const patient = inserted[0]
  if (conversation_state) {
    await trx.insertInto('patient_chatbot_users')
      .values({
        entity_id: patient.id,
        phone_number: patient.phone_number!,
        conversation_state,
        data: '{}',
      })
      .execute()
  }
  return patient
}

export function update(
  trx: TrxOrDb,
  { id, name, location, primary_doctor_id, ...patient }: Partial<Patient> & {
    id: string
  },
) {
  const to_update = {
    ...patient,
    primary_doctor_id,
    location: location && literalLocation(location),
  }
  const to_update_with_name: (typeof to_update) & {
    name?: string
  } = to_update
  if (name) {
    to_update_with_name.name = name
  }
  return trx.updateTable('patients')
    .where('id', '=', id)
    .set(to_update_with_name)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function upsert(
  trx: TrxOrDb,
  patient: PatientUpsert,
) {
  const to_upsert = asPatientValues(patient)
  return trx
    .insertInto('patients')
    .values(to_upsert)
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(to_upsert))
    .onConflict((oc) => oc.column('id').doUpdateSet(to_upsert))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function remove(trx: TrxOrDb, opts: { phone_number: string }) {
  return trx
    .deleteFrom('patients')
    .where('phone_number', '=', opts.phone_number)
    .executeTakeFirst()
}

const model = base({
  top_level_table: 'patients',
  baseQuery,
  formatResult: (x: RenderedPatient): RenderedPatient => x,
  handleSearch(
    qb,
    { search, has_name, include_incomplete_registration }: {
      search?: Maybe<string>
      has_name?: boolean
      include_incomplete_registration?: boolean
    },
  ) {
    if (has_name) {
      qb = qb.where('patients.name', 'is not', null)
    }
    if (search) {
      qb = qb.where('patients.name', 'ilike', `%${search}%`)
    }
    if (!include_incomplete_registration) {
      qb = qb.where(
        'patients.completed_registration',
        '=',
        true,
      )
    }
    return qb
  },
})

export const getById = model.getById
export const getByIds = model.getByIds
export const search = model.search
export type PatientCard = {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  primary_doctor_id: string | null
  actions: {
    view: string
  }
}

export function getCardQuery(
  trx: TrxOrDb,
): SelectQueryBuilder<DB, 'patients', PatientCard> {
  return trx.selectFrom('patients')
    .leftJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .select((eb) => [
      'patients.id',
      eb.ref('patients.name').$notNull().as('name'),
      sql<string | null>`patients.gender || ', ' || patient_age.age_display`.as(
        'description',
      ),
      avatar_url_sql.as('avatar_url'),
      'patients.primary_doctor_id',
      jsonBuildObject({
        view: view_href_sql,
      }).as('actions'),
    ])
}

export async function findAllWithNames(
  trx: TrxOrDb,
  search_terms: {
    search?: Maybe<string>
    include_incomplete_registration?: boolean
  },
): Promise<RenderedPatient[]> {
  const patients = await model.findAll(trx, {
    ...search_terms,
    has_name: true,
  })
  assert(haveNames(patients))
  return patients
}

export function getAvatar(trx: TrxOrDb, opts: { patient_id: string }) {
  return trx
    .selectFrom('media')
    .innerJoin('patients', 'patients.avatar_media_id', 'media.id')
    .select(['media.mime_type', 'media.binary_data'])
    .where('patients.id', '=', opts.patient_id)
    .executeTakeFirst()
}

export async function nearestFacilities(
  trx: TrxOrDb,
  patient_id: string,
) {
  const { location } = await trx.selectFrom('patients')
    .where('id', '=', patient_id)
    .where('location', 'is not', null)
    .select([
      jsonBuildObject({
        longitude: sql<number>`ST_X(location::geometry)`,
        latitude: sql<number>`ST_Y(location::geometry)`,
      }).as('location'),
    ])
    .executeTakeFirstOrThrow()

  const { results: nearest_facilities } = await nearest_organizations.search(
    trx,
    {
      location,
    },
    {
      rows_per_page: 20,
    },
  )

  return pMap(
    nearest_facilities,
    async (organization): Promise<HasStringId<PatientNearestOrganization>> => {
      const walking_distance = await getWalkingDistance({
        origin: {
          longitude: location.longitude,
          latitude: location.latitude,
        },
        destination: {
          longitude: organization.location.longitude,
          latitude: organization.location.latitude,
        },
      })
      return { ...organization, walking_distance }
    },
  )
}

export async function schedulingAppointmentRequest(
  trx: TrxOrDb,
  patient_id: string,
): Promise<null | PatientSchedulingAppointmentRequest> {
  // deno-lint-ignore no-explicit-any
  const result = await sql<any>`
      WITH aot_pre as (
        SELECT patient_appointment_offered_times.*,
               health_workers.name as health_worker_name,
               employment.profession
          FROM patient_appointment_offered_times
          JOIN employment ON patient_appointment_offered_times.provider_id = employment.id
          JOIN health_workers ON employment.health_worker_id = health_workers.id
      )

      SELECT patient_appointment_requests.id as patient_appointment_request_id,
             patient_appointment_requests.reason,
             json_agg(aot_pre.*) as offered_times
        FROM patient_appointment_requests
   LEFT JOIN aot_pre ON patient_appointment_requests.id = aot_pre.patient_appointment_request_id
       WHERE patient_appointment_requests.id is not null
         AND patient_id = ${patient_id}
    GROUP BY patient_appointment_requests.id, patient_appointment_requests.patient_id, patient_appointment_requests.reason
  `.execute(trx)

  return result.rows[0] || null
}

export function scheduledAppointments(
  trx: TrxOrDb,
  patient_id: string,
): Promise<{
  id: string
  reason: string
  provider_id: string
  gcal_event_id: string
  start: Date
  health_worker_name: string
}[]> {
  return trx.selectFrom('appointments')
    .innerJoin(
      'appointment_providers',
      'appointment_providers.appointment_id',
      'appointments.id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'appointment_providers.provider_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .select([
      'appointments.id',
      'appointments.reason',
      'appointment_providers.provider_id',
      'appointments.gcal_event_id',
      'appointments.start',
      'health_workers.name as health_worker_name',
    ])
    .where('patient_id', '=', patient_id)
    .execute()
}

export async function getPreferredLanguage(
  trx: TrxOrDb,
  patient_id: string,
) {
  const patient = await trx.selectFrom('patients')
    .where('id', '=', patient_id)
    .select([
      'preferred_language_code_iso_639_2_b',
    ])
    .executeTakeFirst()

  return patient?.preferred_language_code_iso_639_2_b || null
}
