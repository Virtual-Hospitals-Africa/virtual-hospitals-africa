import { Maybe, PatientEncounterReason, TrxOrDb } from '../../types.ts'
import * as waiting_room from './waiting_room.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export type Create = {
  patient_id: number
  reason: PatientEncounterReason
  provider_id: number | 'next_available'
  appointment_id?: Maybe<number>
  notes?: Maybe<string>
}

export const reasons = new Set<PatientEncounterReason>([
  'seeking treatment',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
])

export function assertIsEncounterReason(
  str: string,
): asserts str is PatientEncounterReason {
  assertOr400(reasons.has(str as PatientEncounterReason))
}

export function assertIsCreate(
  obj: unknown,
): asserts obj is Create {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.patient_id === 'number', JSON.stringify(obj))
  assertOr400(typeof obj.reason === 'string')
  assertIsEncounterReason(obj.reason)
  assertOr400(
    obj.provider_id === 'next_available' || typeof obj.provider_id === 'number',
  )
  assertOr400(
    obj.appointment_id == null || typeof obj.appointment_id === 'number',
  )
  assertOr400(obj.notes == null || typeof obj.notes === 'string')
}

export async function create(
  trx: TrxOrDb,
  facility_id: number,
  { patient_id, reason, appointment_id, notes, provider_id }: Create,
) {
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

  const adding_provider = provider_id && typeof provider_id === 'number' && trx
    .insertInto('patient_encounter_providers')
    .values({
      patient_encounter_id: created.id,
      provider_id,
    })
    .execute()

  const adding_to_waiting_room = waiting_room.add(trx, {
    patient_encounter_id: created.id,
    facility_id,
  })

  await Promise.all([adding_provider, adding_to_waiting_room])

  return created
}
