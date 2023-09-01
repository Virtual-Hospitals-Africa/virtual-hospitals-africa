import { assert } from 'std/testing/asserts.ts'
import { sql } from 'kysely'
import {
  Gender,
  HasDemographicInfo,
  Location,
  Maybe,
  Patient,
  PatientConversationState,
  PatientDemographicInfo,
  PatientState,
  PatientWithMedicalRecord,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import haveNames from '../../util/haveNames.ts'
import { getWalkingDistance } from '../../external-clients/google.ts'

export async function getByPhoneNumber(
  trx: TrxOrDb,
  query: { phone_number: string },
): Promise<
  Maybe<ReturnedSqlRow<Patient>>
> {
  const result = await trx
    .selectFrom('patients')
    .selectAll()
    .where('phone_number', '=', query.phone_number)
    .execute()
  return result && result[0]
}

export function upsert(trx: TrxOrDb, info: {
  id?: number
  conversation_state: PatientConversationState
  phone_number: string
  name: Maybe<string>
  gender: Maybe<Gender>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
  location?: Maybe<Location>
  avatar_media_id?: number
  country?: Maybe<string>
  province?: Maybe<string>
  district?: Maybe<string>
  ward?: Maybe<string>
  street?: Maybe<string>
}): Promise<ReturnedSqlRow<Patient>> {
  const toInsert = {
    ...info,
    location: info.location
      ? sql`ST_SetSRID(ST_MakePoint(${info.location.longitude}, ${info.location.latitude})::geography, 4326)` as unknown as Location
      : null,
  }
  return trx
    .insertInto('patients')
    .values(toInsert)
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(toInsert))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function remove(trx: TrxOrDb, opts: { phone_number: string }) {
  return trx
    .deleteFrom('patients')
    .where('phone_number', '=', opts.phone_number)
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
  const patients = await trx
    .selectFrom('patients')
    .selectAll()
    .where('id', 'in', opts.ids)
    .execute()

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

export async function getAllWithNames(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<ReturnedSqlRow<Patient & { name: string }>[]> {
  let query = trx
    .selectFrom('patients')
    .innerJoin('facilities', 'facilities.id', 'patients.nearest_facility_id')
    .select([
      'patients.id', 
      'patients.avatar_media_id',
      'patients.name',
      'patients.phone_number',
      'patients.location',
      'patients.gender',
      'patients.date_of_birth',
      'patients.national_id_number',
      'patients.conversation_state',
      'patients.country',
      'patients.province',
      'patients.district',
      'patients.ward',
      'patients.suburb',
      'patients.street',
      'patients.created_at',
      'patients.updated_at',
      'facilities.name as nearest_facility'
    ])
    .where('patients.name', 'is not', null)

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  const patients = await query.execute()

  assert(haveNames(patients))

  return patients
}

export function pick(patientState: PatientState) {
  return {
    id: patientState.patient_id,
    phone_number: patientState.phone_number,
    name: patientState.name,
    gender: patientState.gender,
    date_of_birth: patientState.date_of_birth,
    national_id_number: patientState.national_id_number,
    conversation_state: patientState.conversation_state,
    location: patientState.location,
    country: patientState.country,
    province: patientState.province,
    district: patientState.district,
    ward: patientState.ward,
    street: patientState.street,
  }
}

export function hasDemographicInfo(
  patient: Partial<PatientDemographicInfo>,
): patient is HasDemographicInfo {
  return (
    !!patient.phone_number &&
    !!patient.name &&
    !!patient.gender &&
    !!patient.date_of_birth &&
    !!patient.national_id_number
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

  assert(patient.nearest_facilities.length > 0)

  const updated_nearest_facilities = await Promise.all(
    patient.nearest_facilities.map(async (facility) => ({
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
    })),
  )

  return updated_nearest_facilities
}
