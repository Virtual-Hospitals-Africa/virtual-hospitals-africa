import { type Allergy, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { now } from '../helpers.ts'

export async function upsert(
  trx: TrxOrDb,
  patient_id: string,
  allergies: { snomed_concept_id: string }[],
): Promise<void> {
  assertOr400(
    allergies.length ===
      new Set(allergies.map((item) => item.snomed_concept_id)).size,
    'Allergy ids must be unique',
  )

  const removing_allergies = trx
    .deleteFrom('patient_allergies')
    .where('patient_id', '=', patient_id)
    .where('created_at', '<=', now)
    .execute()

  const adding_allergies = allergies.length && trx
    .insertInto('patient_allergies')
    .values(allergies.map(({ snomed_concept_id }) => ({
      patient_id,
      snomed_concept_id,
    })))
    .execute()

  await Promise.all([removing_allergies, adding_allergies])
}

export function getWithName(
  trx: TrxOrDb,
  patient_id: string,
): Promise<Allergy[]> {
  return trx
    .selectFrom('patient_allergies')
    .innerJoin(
      'snomed_concepts',
      'patient_allergies.snomed_concept_id',
      'snomed_concepts.snomed_concept_id',
    )
    .where('patient_allergies.patient_id', '=', patient_id)
    .select([
      'patient_allergies.id as patient_allergy_id',
      'snomed_concepts.snomed_concept_id',
      'snomed_concepts.snomed_english_term as snomed_english_term',
    ])
    .execute()
}
