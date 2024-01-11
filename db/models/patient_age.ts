import { PatientAge } from '../../db.d.ts'
import { Maybe, TrxOrDb } from '../../types.ts'

export function get(
  trx: TrxOrDb,
  opts: { patient_id: number },
): Promise<Maybe<PatientAge>> {
  return trx
    .selectFrom('patient_age')
    .selectAll()
    .where('patient_age.patient_id', '=', opts.patient_id)
    .executeTakeFirst()
}
