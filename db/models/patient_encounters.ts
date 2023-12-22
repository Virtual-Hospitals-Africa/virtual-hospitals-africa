import { Maybe, PatientEncounterReason, TrxOrDb } from '../../types.ts'
import * as waiting_room from './waiting_room.ts'

export async function create(
  trx: TrxOrDb,
  { facility_id, provider_id, ...encounter }: {
    patient_id: number
    facility_id: number
    reason: PatientEncounterReason
    provider_id?: Maybe<number>
    appointment_id?: Maybe<number>
    notes?: Maybe<string>
  },
) {
  const { id } = await trx
    .insertInto('patient_encounters')
    .values(encounter)
    .returning('id')
    .executeTakeFirstOrThrow()

  const adding_provider = provider_id && trx
    .insertInto('patient_encounter_providers')
    .values({
      patient_encounter_id: id,
      provider_id,
    })
    .execute()

  const adding_to_waiting_room = waiting_room.add(trx, {
    patient_encounter_id: id,
    facility_id,
  })

  await Promise.all([adding_provider, adding_to_waiting_room])

  return id
}
