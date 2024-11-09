import { type Allergy, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export async function upsert(
  trx: TrxOrDb,
  patient_id: string,
  allergies: {
    patient_allergy_id: string
    snomed_concept_id: number
    snomed_english_term: string
  }[],
): Promise<{
  id: string
  snomed_concept_id: number
}[]> {
  assertOr400(
    allergies.length ===
      new Set(allergies.map((item) => item.snomed_concept_id)).size,
    'Allergy ids must be unique',
  )

  const inserting_snomed_concepts = allergies.length &&
    trx.insertInto('snomed_concepts').values(
      allergies.map(({ snomed_concept_id, snomed_english_term }) => ({
        snomed_concept_id,
        snomed_english_term,
      })),
    ).onConflict((oc) => oc.doNothing())
      .returningAll().execute()

  const removing_allergies = trx
    .deleteFrom('patient_allergies')
    .where('patient_id', '=', patient_id)
    .$if(
      allergies.length > 0,
      (qb) =>
        qb.where(
          'snomed_concept_id',
          'not in',
          allergies.map(({ snomed_concept_id }) => snomed_concept_id),
        ),
    )
    .execute()

  const adding_allergies = allergies.length
    ? trx
      .insertInto('patient_allergies')
      .values(allergies.map(({ snomed_concept_id, patient_allergy_id }) => ({
        id: patient_allergy_id,
        patient_id,
        snomed_concept_id,
      })))
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .execute()
    : Promise.resolve([])

  const [, , inserted_allergies] = await Promise.all([
    inserting_snomed_concepts,
    removing_allergies,
    adding_allergies,
  ])
  return inserted_allergies
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
      'snomed_concepts.snomed_english_term',
    ])
    .execute()
}
