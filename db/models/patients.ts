import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  Address,
  FamilyUpsert,
  Gender,
  Location,
  Maybe,
  OnboardingPatient,
  Patient,
  PatientConversationState,
  PatientNearestFacility,
  PatientOccupation,
  PatientState,
  PatientWithMedicalRecord,
  PreExistingAllergy,
  RenderedPatient,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import haveNames, { hasName } from '../../util/haveNames.ts'
import { getWalkingDistance } from '../../external-clients/google.ts'
import compact from '../../util/compact.ts'
import { upsert as upsertAddress } from './address.ts'
import * as patient_occupations from './patient_occupations.ts'
import * as patient_conditions from './patient_conditions.ts'
import * as patient_allergies from './patient_allergies.ts'
import * as patient_family from './family.ts'
import { jsonBuildObject } from '../helpers.ts'
import isEmpty from '../../util/isEmpty.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isNumber from '../../util/isNumber.ts'
import { assertOr404 } from '../../util/assertOr.ts'

export const href_sql = sql<string>`
  concat('/app/patients/', patients.id::text)
`

export const avatar_url_sql = sql<string | null>`
  CASE WHEN patients.avatar_media_id IS NOT NULL 
    THEN concat('/app/patients/', patients.id::text, '/avatar') 
    ELSE NULL 
  END
`

const baseSelect = (trx: TrxOrDb) =>
  trx
    .selectFrom('patients')
    .leftJoin('facilities', 'facilities.id', 'patients.nearest_facility_id')
    .select([
      'patients.id',
      'patients.name',
      'patients.phone_number',
      'patients.gender',
      'patients.ethnicity',
      sql<string | null>`TO_CHAR(patients.date_of_birth, 'FMDD FMMonth YYYY')`
        .as('dob_formatted'),
      'patients.national_id_number',
      'patients.conversation_state',
      'patients.created_at',
      'patients.updated_at',
      'patients.completed_intake',
      href_sql.as('href'),
      avatar_url_sql.as('avatar_url'),
      'facilities.name as nearest_facility',
      sql<null>`NULL`.as('last_visited'),
      jsonBuildObject({
        longitude: sql<number | null>`ST_X(patients.location::geometry)`,
        latitude: sql<number | null>`ST_Y(patients.location::geometry)`,
      }).as('location'),
    ])

const selectWithName = (trx: TrxOrDb) =>
  baseSelect(trx).where('patients.name', 'is not', null)

export function getByPhoneNumber(
  trx: TrxOrDb,
  query: { phone_number: string },
): Promise<
  Maybe<ReturnedSqlRow<RenderedPatient>>
> {
  return baseSelect(trx)
    .where('phone_number', '=', query.phone_number)
    .executeTakeFirst()
}

// export function getByPhoneNumber(
//   trx: TrxOrDb,
//   query: { phone_number: string },
// ): Promise<
//   Maybe<ReturnedSqlRow<RenderedPatient>>
// > {
//   return baseSelect(trx)
//     .where('phone_number', '=', query.phone_number)
//     .executeTakeFirst()
// }

export type UpsertPatientIntake = {
  id: number
  conversation_state?: PatientConversationState
  phone_number?: string
  gender?: Maybe<Gender>
  date_of_birth?: Maybe<string>
  national_id_number?: Maybe<string>
  nearest_facility_id?: Maybe<number>
  primary_doctor_id?: Maybe<number>
  location?: Maybe<Location>
  avatar_media_id?: number
  address_id?: number
  completed_intake?: boolean
  name?: Maybe<string>
  first_name?: Maybe<string>
  middle_names?: Maybe<string>
  last_name?: Maybe<string>
  address?: Address
  unregistered_primary_doctor_name?: Maybe<string>
  allergies?: PreExistingAllergy[]
  pre_existing_conditions?: patient_conditions.PreExistingConditionUpsert[]
  family?: FamilyUpsert
  occupation?: Omit<PatientOccupation, 'patient_id'>
}

export function insertMany(
  trx: TrxOrDb,
  patients: Array<Partial<Patient>>,
) {
  assert(patients.length > 0, 'Must insert at least one patient')
  return trx
    .insertInto('patients')
    .values(patients.map((patient) => ({
      ...patient,
      location: patient.location
        ? sql<
          string
        >`ST_SetSRID(ST_MakePoint(${patient.location.longitude}, ${patient.location.latitude})::geography, 4326)`
        : null,
      conversation_state: patient.conversation_state || 'initial_message',
      completed_intake: patient.completed_intake || false,
    })))
    .returningAll()
    .execute()
}

export function upsert(
  trx: TrxOrDb,
  patient: Partial<Patient> & { id?: number },
) {
  const to_upsert = {
    ...patient,
    location: patient.location
      ? sql<
        string
      >`ST_SetSRID(ST_MakePoint(${patient.location.longitude}, ${patient.location.latitude})::geography, 4326)`
      : null,
    conversation_state: patient.conversation_state || 'initial_message',
    completed_intake: patient.completed_intake || false,
  }
  return trx
    .insertInto('patients')
    .values(to_upsert)
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(to_upsert))
    .onConflict((oc) => oc.column('id').doUpdateSet(to_upsert))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function upsertIntake(
  trx: TrxOrDb,
  {
    id,
    first_name,
    middle_names,
    last_name,
    address,
    family,
    pre_existing_conditions,
    allergies,
    occupation,
    ...patient_updates
  }: UpsertPatientIntake,
): Promise<void> {
  const upserting_occupation = occupation && patient_occupations.upsert(trx, {
    ...occupation,
    patient_id: id,
  })

  const upserting_conditions = pre_existing_conditions &&
    patient_conditions.upsertPreExisting(
      trx,
      id,
      pre_existing_conditions,
    )

  const upserting_allergies = allergies &&
    patient_allergies.upsert(
      trx,
      id,
      allergies,
    )

  const upserting_family = family &&
    patient_family.upsert(
      trx,
      id,
      family,
    )

  if (first_name) {
    assert(!patient_updates.name, 'Cannot set both name and first_name')
    patient_updates.name = compact(
      [first_name, middle_names, last_name],
    ).join(' ')
  }
  if (address) {
    assert(
      !patient_updates.address_id,
      'Cannot set both address and address_id',
    )
    patient_updates.address_id = (await upsertAddress(trx, address)).id
  }

  const upserting_patient = !isEmpty(patient_updates) &&
    upsert(trx, { ...patient_updates, id })

  await Promise.all([
    upserting_patient,
    upserting_conditions,
    upserting_allergies,
    upserting_family,
    upserting_occupation,
  ])
}

export function remove(trx: TrxOrDb, opts: { phone_number: string }) {
  return trx
    .deleteFrom('patients')
    .where('phone_number', '=', opts.phone_number)
    .executeTakeFirst()
}

export function getByID(
  trx: TrxOrDb,
  opts: { id: number },
): Promise<ReturnedSqlRow<RenderedPatient>> {
  return baseSelect(trx)
    .where('patients.id', '=', opts.id)
    .executeTakeFirstOrThrow()
}

export function getOnboarding(
  trx: TrxOrDb,
  opts: {
    id: number
  },
): Promise<Maybe<OnboardingPatient>> {
  return trx
    .selectFrom('patients')
    .leftJoin('address', 'address.id', 'patients.address_id')
    .leftJoin('facilities', 'facilities.id', 'patients.nearest_facility_id')
    .leftJoin(
      'health_workers',
      'health_workers.id',
      'patients.primary_doctor_id',
    )
    .select((eb) => [
      'patients.id',
      'patients.name',
      'patients.phone_number',
      'patients.location',
      'patients.gender',
      'patients.ethnicity',
      sql<null | string>`TO_CHAR(patients.date_of_birth, 'YYYY-MM-DD')`.as(
        'date_of_birth',
      ),
      'patients.national_id_number',
      jsonBuildObject({
        country_id: eb.ref('address.country_id'),
        province_id: eb.ref('address.province_id'),
        district_id: eb.ref('address.district_id'),
        ward_id: eb.ref('address.ward_id'),
        suburb_id: eb.ref('address.suburb_id'),
        street: eb.ref('address.street'),
      }).as('address'),
      'patients.completed_intake',
      'patients.primary_doctor_id',
      'patients.unregistered_primary_doctor_name',
      sql<
        string | null
      >`CASE WHEN patients.avatar_media_id IS NOT NULL THEN concat('/app/patients/', patients.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      'patients.nearest_facility_id',
      'facilities.display_name as nearest_facility_display_name',
      'health_workers.name as primary_doctor_name',
    ])
    .where('patients.id', '=', opts.id)
    .executeTakeFirst()
}

// TODO: implement medical record functionality
// TODO: only show medical record if health worker has permission
export async function getWithMedicalRecords(
  trx: TrxOrDb,
  opts: {
    ids: number[]
    health_worker_id?: number
  },
): Promise<ReturnedSqlRow<PatientWithMedicalRecord>[]> {
  assert(opts.ids.length, 'Must select nonzero patients')
  const patients = await selectWithName(trx)
    .where('patients.id', 'in', opts.ids)
    .execute()

  assert(haveNames(patients))

  return patients.map((patient) => ({
    ...patient,
    medical_record: {
      allergies: [
        'chocolate',
        'bananas',
      ],
      history: {},
    },
  }))
}

export async function getCard(trx: TrxOrDb, opts: { id: number }) {
  const patient = await trx.selectFrom('patients')
    .innerJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .select([
      'patients.id',
      'patients.name',
      sql<string | null>`patients.gender || ', ' || patient_age.age_display`.as(
        'description',
      ),
      avatar_url_sql.as('avatar_url'),
    ])
    .where('patients.id', '=', opts.id)
    .executeTakeFirst()

  assertOr404(patient)
  assert(hasName(patient))

  return patient
}

export async function getAllWithNames(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedPatient[]> {
  let query = baseSelect(trx).where('patients.name', 'is not', null)

  if (search) query = query.where('patients.name', 'ilike', `%${search}%`)

  const patients = await query.execute()

  assert(haveNames(patients))

  return patients
}

export function getAvatar(trx: TrxOrDb, opts: { patient_id: number }) {
  return trx
    .selectFrom('media')
    .innerJoin('patients', 'patients.avatar_media_id', 'media.id')
    .select(['media.mime_type', 'media.binary_data'])
    .where('patients.id', '=', opts.patient_id)
    .executeTakeFirst()
}

export function hasDemographicInfo(
  patientState: PatientState,
): boolean {
  return (
    !!patientState.name &&
    !!patientState.gender &&
    !!patientState.dob_formatted &&
    !!patientState.national_id_number
  )
}

export async function nearestFacilities(
  trx: TrxOrDb,
  patient_id: number,
  currentLocation: Location,
) {
  const patient = await trx
    .selectFrom('patient_nearest_facilities')
    .selectAll()
    .where('patient_id', '=', patient_id)
    .executeTakeFirstOrThrow()

  assert(Array.isArray(patient.nearest_facilities))
  assert(patient.nearest_facilities.length > 0)

  return Promise.all(
    patient.nearest_facilities.map(async (facility) => (
      assert(isObjectLike(facility)),
        assert(isNumber(facility.longitude)),
        assert(isNumber(facility.latitude)),
        {
          ...facility,
          walking_distance: await getWalkingDistance({
            origin: {
              longitude: currentLocation.longitude,
              latitude: currentLocation.latitude,
            },
            destination: {
              longitude: facility.longitude,
              latitude: facility.latitude,
            },
          }),
        } as ReturnedSqlRow<PatientNearestFacility>
    )),
  )
}
