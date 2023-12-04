import { PatientCondition, TrxOrDb } from '../../types.ts'

export function upsert(
  trx: TrxOrDb,
  patient_id: number,
  condition_key_ids: string[],
) {
  const conditions: PatientCondition[] = condition_key_ids.map(
    (condition_key_id) => (
      { patient_id, condition_key_id, start_date: '2022-11-11', end_date: null }
    ),
  )
  return trx
    .insertInto('patient_conditions')
    .values(conditions)
    .returningAll()
    .execute()
}
