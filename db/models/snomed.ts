import { TrxOrDb } from '../../types.ts'

export function insertConcepts(
  trx: TrxOrDb,
  concepts: {
    snomed_concept_id: number
    snomed_english_term: string
  }[],
) {
  if (!concepts.length) return Promise.resolve([])

  return trx.insertInto('snomed_concepts').values(concepts).onConflict((oc) =>
    oc.doNothing()
  )
    .returningAll().execute()
}
