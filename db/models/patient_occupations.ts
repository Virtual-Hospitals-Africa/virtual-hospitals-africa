import { PatientOccupation, TrxOrDb } from '../../types.ts'
//TODO: upsert instead of add
export function upsert(
  trx: TrxOrDb,
  opts: PatientOccupation,
) {
  console.log('opts', opts)
  return trx
    .insertInto('patient_occupations')
    .values(opts)
    .execute()
}
