import { PatientSymptomUpsert, TrxOrDb } from '../../types.ts'
import { isoDate } from '../helpers.ts'

export async function upsert(
  trx: TrxOrDb,
  { symptoms, patient_id, encounter_id, encounter_provider_id }: {
    patient_id: number
    encounter_id: number
    encounter_provider_id: number
    symptoms: PatientSymptomUpsert[]
  },
) {
  const removing_symptoms = trx.deleteFrom('patient_symptoms')
    .where('patient_symptoms.patient_id', '=', patient_id)
    .where('patient_symptoms.encounter_id', '=', encounter_id)
    .execute()

  const to_insert = symptoms.map((s) => ({
    ...s,
    patient_id,
    encounter_id,
    encounter_provider_id,
  }))

  const results = await trx
    .insertInto('patient_symptoms')
    .values(to_insert)
    .returning('id')
    .execute()

  await removing_symptoms
  return results
}

export function getEncounter(
  trx: TrxOrDb,
  { patient_id, encounter_id }: {
    patient_id: number
    encounter_id: number | 'open'
  },
): Promise<PatientSymptomUpsert[]> {
  let query = trx
    .selectFrom('patient_symptoms')
    .where('patient_symptoms.patient_id', '=', patient_id)
    .select((eb) => [
      'symptom',
      'severity',
      'site',
      isoDate(eb.ref('start_date')).as('start_date'),
      isoDate(eb.ref('end_date')).as('end_date'),
      'notes',
    ])

  // TODO: abstract this out into patient_encounters model
  if (encounter_id !== 'open') {
    query = query.where('patient_symptoms.encounter_id', '=', encounter_id)
  } else {
    query = query.innerJoin(
      'patient_encounters',
      'patient_encounters.id',
      'patient_symptoms.encounter_id',
    )
      .where('patient_encounters.patient_id', '=', patient_id)
      .where('patient_encounters.closed_at', 'is', null)
  }

  return query.execute()
}
