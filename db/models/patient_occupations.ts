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

export async function get(
  trx: TrxOrDb, 
  {patient_id}: { patient_id: number }
  ): Promise<PatientOccupation> {
  // throw new Error('Function not implemented.')
  const gettingOccupation = trx
    .selectFrom('patient_occupations')
    .where('patient_id', '=', patient_id)
    .execute()
    return {
      patient_id: patient_id,
      school: await gettingOccupation
    }
}
