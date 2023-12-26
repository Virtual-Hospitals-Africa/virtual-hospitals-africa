import { assert } from 'std/assert/assert.ts'
import { Maybe, PatientEncounterReason, TrxOrDb } from '../../types.ts'
import * as waiting_room from './waiting_room.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export type Create = {
  patient_id: number
  facility_id: number
  reason: PatientEncounterReason
  provider_id?: Maybe<number>
  appointment_id?: Maybe<number>
  notes?: Maybe<string>
}

const reasons = new Set<PatientEncounterReason>([
  'seeking_treatment',
  'appointment',
  'follow_up',
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
  assertOr400(typeof obj.patient_id === 'number')
  assertOr400(typeof obj.facility_id === 'number')
  assertOr400(typeof obj.reason === 'string')
  assertIsEncounterReason(obj.reason)
  assertOr400(obj.provider_id == null || typeof obj.provider_id === 'number')
  assertOr400(obj.appointment_id == null || typeof obj.appointment_id === 'number')
  assertOr400(obj.notes == null || typeof obj.notes === 'string')
}

export async function create(
  trx: TrxOrDb,
  { facility_id, provider_id, ...encounter }: Create,
) {
  const created = await trx
    .insertInto('patient_encounters')
    .values(encounter)
    .returning('id')
    .executeTakeFirstOrThrow()

  const adding_provider = provider_id && trx
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
