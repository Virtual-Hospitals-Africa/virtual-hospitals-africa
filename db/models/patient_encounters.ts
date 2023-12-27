import { Maybe, PatientEncounterReason, TrxOrDb } from '../../types.ts'
import * as waiting_room from './waiting_room.ts'
import * as patients from './patients.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export type Create =
  & {
    reason: PatientEncounterReason
    provider_ids?: number[]
    appointment_id?: Maybe<number>
    notes?: Maybe<string>
  }
  & (
    | { patient_id: number; patient_name?: Maybe<string> }
    | { patient_id?: Maybe<number>; patient_name: string }
  )

export const reasons = new Set<PatientEncounterReason>([
  'seeking treatment',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
])

export const drop_in_reasons: PatientEncounterReason[] = [
  'seeking treatment',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
]

export function assertIsEncounterReason(
  str: string,
): asserts str is PatientEncounterReason {
  assertOr400(reasons.has(str as PatientEncounterReason))
}

export function assertIsCreate(
  obj: unknown,
): asserts obj is Create {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.patient_name === 'string')
  assertOr400(obj.patient_id == null || typeof obj.patient_id === 'number')
  assertOr400(typeof obj.reason === 'string')
  assertIsEncounterReason(obj.reason)
  assertOr400(
    !obj.provider_ids ||
      (Array.isArray(obj.provider_ids) &&
        obj.provider_ids.every((id: unknown) => typeof id === 'number')),
  )
  assertOr400(
    obj.appointment_id == null || typeof obj.appointment_id === 'number',
  )
  assertOr400(obj.notes == null || typeof obj.notes === 'string')
}

export async function create(
  trx: TrxOrDb,
  facility_id: number,
  { patient_id, patient_name, reason, appointment_id, notes, provider_ids }:
    Create,
) {
  if (!patient_id) {
    assertOr400(patient_name)
    patient_id = (await patients.upsert(trx, { name: patient_name })).id
  }

  const created = await trx
    .insertInto('patient_encounters')
    .values({
      patient_id,
      reason,
      notes,
      appointment_id: appointment_id || null,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const adding_providers = provider_ids?.length && trx
    .insertInto('patient_encounter_providers')
    .values(provider_ids.map((provider_id) => ({
      patient_encounter_id: created.id,
      provider_id,
    })))
    .execute()

  const adding_to_waiting_room = waiting_room.add(trx, {
    patient_encounter_id: created.id,
    facility_id,
  })

  await Promise.all([adding_providers, adding_to_waiting_room])

  return created
}
