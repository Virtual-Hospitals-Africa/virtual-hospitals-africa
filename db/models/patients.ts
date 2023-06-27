import { assert } from 'std/_util/asserts.ts'
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
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'

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

export async function upsert(trx: TrxOrDb, info: {
  id?: number
  conversation_state: PatientConversationState
  phone_number: string
  name: Maybe<string>
  gender: Maybe<Gender>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
  location: Maybe<Location>
}): Promise<ReturnedSqlRow<Patient>> {
  const [patient] = await trx
    .insertInto('patients')
    .values(info)
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(info))
    .returningAll()
    .execute()

  return patient
}

export async function upsertLocation(trx: TrxOrDb, info: {
  id?: number
  conversation_state: PatientConversationState
  phone_number: string
  name: Maybe<string>
  gender: Maybe<Gender>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
  location: Maybe<Location>
}): Promise<ReturnedSqlRow<Patient>> {
  let locationAsGeography

  // Check if location is not null or undefined
  if (info.location) {
    // Convert the location into a geography type
    locationAsGeography =
      sql`ST_SetSRID(ST_MakePoint(${info.location.longitude}, ${info.location.latitude})::geography, 4326)`
  } else {
    // If location is null or undefined, set it to null in the database
    locationAsGeography = null
  }

  // Create a new info object with location in the new format
  const newInfo = {
    ...info,
    location: locationAsGeography,
  }
  const [patient] = await trx
    .insertInto('patients')
    .values(newInfo)
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(newInfo))
    .returningAll()
    .execute()

  return patient
}

export function remove(trx: TrxOrDb, opts: { phone_number: string }) {
  return trx
    .deleteFrom('patients')
    .where('phone_number', '=', opts.phone_number)
    .execute()
}

// TODO: implement medical record functionality
export function getWithMedicalRecords(
  trx: TrxOrDb,
  ids: number[],
) {
  assert(ids.length, 'Must provide ids to decline')
  return trx
    .selectFrom('patients')
    .selectAll()
    .where('id', 'in', ids)
    .execute()
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
