import { assert } from 'std/assert/assert.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import {
  Gender,
  HasStringId,
  Location,
  Maybe,
  PatientNearestOrganization,
  PatientSchedulingAppointmentRequest,
  PatientWithOpenEncounter,
  RenderedPatient,
  TrxOrDb,
} from '../../types.ts'
import { Patient as MedplumPatient } from 'medplum_fhirtypes'
import { haveNames } from '../../util/haveNames.ts'
import { getWalkingDistance } from '../../external-clients/google.ts'
import * as conversations from './conversations.ts'
import * as examinations from './examinations.ts'
import * as patient_encounters from './patient_encounters.ts'
import {
  jsonArrayFrom,
  jsonArrayFromColumn,
  jsonBuildObject,
  longFormattedDate,
} from '../helpers.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isNumber from '../../util/isNumber.ts'
import { DB } from '../../db.d.ts'
import {
  batchInsert,
  createResource,
  patchResource,
} from '../../external-clients/medplum/client.ts'
import last from '../../util/last.ts'
import { name_string_sql } from './human_name.ts'

export const view_href_sql = sql<string>`
  concat('/app/patients/', Patient.id::text)
`

export const avatar_url_sql = sql<string | null>`
  CASE WHEN Patient.avatar_media_id IS NOT NULL 
    THEN concat('/app/patients/', Patient.id::text, '/avatar') 
    ELSE NULL 
  END
`

export const intake_clinical_notes_href_sql = sql<string>`
  concat('/app/patients/', Patient.id::text, '/intake/review')
`

const dob_formatted = longFormattedDate('Patient.birthDate').as(
  'dob_formatted',
)

const baseSelect = (trx: TrxOrDb) =>
  trx
    .selectFrom('Patient')
    .innerJoin(
      'HumanName as PatientName',
      'Patient.id',
      'PatientName.resourceId',
    )
    .leftJoin(
      'Organization',
      'Organization.id',
      'Patient.organizationId',
    )
    .leftJoin(
      'Address',
      'Address.resourceId',
      'Patient.id',
    )
    .leftJoin(
      'patient_intake_completed',
      'patient_intake_completed.patient_id',
      'Patient.id',
    )
    .leftJoin('patient_age', 'patient_age.patient_id', 'Patient.id')
    .select((eb) => [
      'Patient.id',
      name_string_sql('PatientName').as('name'),
      'Patient.phone_number',
      'Patient.gender',
      'Patient.ethnicity',
      'Address.address',
      eb('patient_intake_completed.patient_id', 'is not', null).as(
        'intake_completed',
      ),
      dob_formatted,
      'patient_age.age_display',
      sql<
        string | null
      >`Patient.gender || ', ' || to_char(birthDate, 'DD/MM/YYYY')`.as(
        'description',
      ),
      'Patient.national_id_number',
      jsonArrayFromColumn(
        'intake_step',
        eb.selectFrom('patient_intake')
          .innerJoin(
            'intake',
            'intake.step',
            'patient_intake.intake_step',
          )
          .whereRef('patient_id', '=', 'Patient.id')
          .orderBy(['intake.order desc'])
          .select(['intake_step']),
      ).as('intake_steps_completed'),
      avatar_url_sql.as('avatar_url'),
      'Organization.canonicalName as nearest_organization',
      sql<null>`NULL`.as('last_visited'),
      jsonBuildObject({
        longitude: sql<number | null>`ST_X(Patient.location::geometry)`,
        latitude: sql<number | null>`ST_Y(Patient.location::geometry)`,
      }).as('location'),
      jsonBuildObject({
        view: view_href_sql,
      }).as('actions'),
    ])

export async function getLastConversationState(
  trx: TrxOrDb,
  query: { phone_number: string },
) {
  const getting_patient = baseSelect(trx)
    .where('Patient.phone_number', '=', query.phone_number)
    .executeTakeFirst()

  const getting_last_message = conversations.getUser(
    trx,
    'patient',
    {
      phone_number: query.phone_number,
    },
  )

  const patient = await getting_patient
  const last_message = await getting_last_message
  return { ...patient, ...last_message }
}

function convertToHumanName(name: string) {
  let given_names = name.split(' ').filter((n) => !!n)
  let family_name = given_names.pop()

  // Interpret "de" in "Camille de Bruglia" into part of the family name
  if (given_names.length >= 2) {
    const maybe_part_of_family_name = last(given_names)!
    if (
      maybe_part_of_family_name[0].toLowerCase() ===
        maybe_part_of_family_name[0]
    ) {
      given_names = given_names.slice(0, -1)
      family_name = `${maybe_part_of_family_name} ${family_name}`
    }
  }
  assert(family_name)
  assert(given_names.length > 1)
  return {
    given: given_names,
    family: family_name,
  }
}

export function insertMany(
  _trx: TrxOrDb,
  patients: MedplumCoercible[],
) {
  assert(patients.length > 0, 'Must insert at least one patient')
  return batchInsert(patients.map(toMedplum))
}

export async function insert(
  trx: TrxOrDb,
  { conversation_state, ...values }: MedplumCoercible & {
    conversation_state?: string
  },
) {
  const patient = await createResource(toMedplum(values))

  // TODO, make this part of a medplum transaction?
  if (conversation_state) {
    assert(values.phone_number)
    await trx.insertInto('patient_chatbot_users')
      .values({
        entity_id: patient.id,
        phone_number: values.phone_number,
        conversation_state,
        data: '{}',
      })
      .execute()
  }

  return patient
}

type MedplumCoercible = {
  name?: string | {
    given: string[]
    family: string
  }
  gender?: Maybe<Gender>
  national_id_number?: Maybe<string>
  avatar_media_id?: Maybe<string>
  phone_number?: Maybe<string>
  birthDate?: Maybe<string>
}

function toMedplum({
  name,
  birthDate,
  national_id_number,
  avatar_media_id,
  gender,
  phone_number,
}: MedplumCoercible): MedplumPatient {
  return {
    resourceType: 'Patient',
    birthDate: birthDate || undefined,
    gender: gender || undefined,
    name: !name
      ? undefined
      : typeof name === 'string'
      ? [convertToHumanName(name)]
      : [name],
    identifier: national_id_number
      ? [
        {
          system:
            'https://github.com/Umlamulankunzi/Zim_ID_Codes/blob/master/README.md',
          value: national_id_number,
        },
      ]
      : undefined,
    extension: avatar_media_id
      ? [
        {
          url: 'avatar_media_id',
          valueString: avatar_media_id,
        },
      ]
      : undefined,
    telecom: phone_number
      ? [
        {
          system: 'phone',
          value: phone_number,
        },
      ]
      : undefined,
  }
}

export function update(
  _trx: TrxOrDb,
  { id, ...updates }: HasStringId<MedplumCoercible>,
) {
  return patchResource({
    id,
    ...toMedplum(updates),
  })
}

export function upsert(
  trx: TrxOrDb,
  { id, ...data }: {
    id?: string
    name: string
    phone_number?: Maybe<string>
    gender?: Maybe<Gender>
  },
) {
  return id ? update(trx, { id, ...data }) : insert(trx, data)
}

export function getByID(
  trx: TrxOrDb,
  opts: { id: string },
): Promise<HasStringId<RenderedPatient>> {
  return baseSelect(trx)
    .where('Patient.id', '=', opts.id)
    .executeTakeFirstOrThrow()
}

// TODO: only show medical record if health worker has permission
export async function getWithOpenEncounter(
  trx: TrxOrDb,
  opts: {
    ids: string[]
    health_worker_id?: string
  },
): Promise<HasStringId<PatientWithOpenEncounter>[]> {
  assert(opts.ids.length, 'Must select nonzero patients')

  const open_encounters = patient_encounters.openQuery(trx)
    .where('patient_encounters.patient_id', 'in', opts.ids)
    .as('open_encounters')

  const patient_examinations_with_recommendations = examinations
    .forPatientEncounter(trx)

  const patients = await baseSelect(trx)
    .where('Patient.id', 'in', opts.ids)
    .leftJoin(open_encounters, 'open_encounters.patient_id', 'Patient.id')
    .select((eb) => [
      eb.case().when(eb('open_encounters.encounter_id', 'is', null)).then(null)
        .else(jsonBuildObject({
          encounter_id: eb.ref('open_encounters.encounter_id').$notNull(),
          created_at: eb.ref('open_encounters.created_at').$notNull(),
          closed_at: eb.ref('open_encounters.closed_at'),
          reason: eb.ref('open_encounters.reason').$notNull(),
          notes: eb.ref('open_encounters.notes'),
          patient_id: eb.ref('open_encounters.patient_id').$notNull(),
          appointment_id: eb.ref('open_encounters.appointment_id'),
          waiting_room_id: eb.ref('open_encounters.waiting_room_id'),
          waiting_room_organization_id: eb.ref(
            'open_encounters.waiting_room_organization_id',
          ),
          providers: eb.ref('open_encounters.providers').$notNull(),
          steps_completed: eb.ref('open_encounters.steps_completed').$notNull(),
          examinations: jsonArrayFrom(
            patient_examinations_with_recommendations
              .selectFrom('patient_examinations_with_recommendations')
              .select([
                'patient_examinations_with_recommendations.examination_name',
                'patient_examinations_with_recommendations.completed',
                'patient_examinations_with_recommendations.skipped',
                'patient_examinations_with_recommendations.ordered',
                'patient_examinations_with_recommendations.recommended',
              ])
              .where(
                'patient_examinations_with_recommendations.encounter_id',
                '=',
                eb.ref('open_encounters.encounter_id').$notNull(),
              ),
          ),
        })).end().as('open_encounter'),
    ])
    .execute()

  assert(haveNames(patients))

  return patients
}

export type PatientCard = {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
}

export function getCardQuery(
  trx: TrxOrDb,
): SelectQueryBuilder<DB, 'Patient', PatientCard> {
  return trx.selectFrom('Patient')
    .innerJoin(
      'HumanName as PatientName',
      'Patient.id',
      'PatientName.resourceId',
    )
    .leftJoin('patient_age', 'patient_age.patient_id', 'Patient.id')
    .select([
      'Patient.id',
      sql<string>`PatientName.given || ' ' || PatientName.family`.as('name'),
      sql<string | null>`Patient.gender || ', ' || patient_age.age_display`.as(
        'description',
      ),
      avatar_url_sql.as('avatar_url'),
    ])
}

export function getCard(
  trx: TrxOrDb,
  { id }: { id: string },
): Promise<PatientCard | undefined> {
  return getCardQuery(trx)
    .where('Patient.id', '=', id)
    .executeTakeFirst()
}

export function getAvatar(trx: TrxOrDb, opts: { patient_id: string }) {
  return trx
    .selectFrom('media')
    .innerJoin('Patient', 'Patient.avatar_media_id', 'media.id')
    .select(['media.mime_type', 'media.binary_data'])
    .where('Patient.id', '=', opts.patient_id)
    .executeTakeFirst()
}

export async function nearestFacilities(
  trx: TrxOrDb,
  patient_id: string,
  currentLocation: Location,
) {
  const patient = await trx
    .selectFrom('patient_nearest_organizations')
    .selectAll()
    .where('patient_id', '=', patient_id)
    .executeTakeFirstOrThrow()

  assert(Array.isArray(patient.nearest_organizations))
  assert(patient.nearest_organizations.length > 0)

  return Promise.all(
    patient.nearest_organizations.map(async (organization) => (
      assert(isObjectLike(organization)),
        assert(isNumber(organization.longitude)),
        assert(isNumber(organization.latitude)),
        {
          ...organization,
          walking_distance: await getWalkingDistance({
            origin: {
              longitude: currentLocation.longitude,
              latitude: currentLocation.latitude,
            },
            destination: {
              longitude: organization.longitude,
              latitude: organization.latitude,
            },
          }),
        } as HasStringId<PatientNearestOrganization>
    )),
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

export function completeIntake(trx: TrxOrDb, values: {
  patient_id: string
  completed_by_employment_id: string
}) {
  return trx.insertInto('patient_intake_completed')
    .values(values)
    .onConflict((oc) => oc.column('patient_id').doNothing())
    .executeTakeFirstOrThrow()
}
