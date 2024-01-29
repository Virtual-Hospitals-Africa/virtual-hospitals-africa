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

export async function getYears(
  trx: TrxOrDb,
  opts: { patient_id: number },
): Promise<Maybe<number>> {
  const patient_age = await get(trx, opts)
  if (!patient_age) return null
  if (!patient_age.age_number) return null
  if (patient_age.age_unit === 'year') {
    return patient_age.age_number
  }
  if (patient_age.age_unit === 'month') {
    return Math.floor(patient_age.age_number / 12)
  }
  return 0
}
