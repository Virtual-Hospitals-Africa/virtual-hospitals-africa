import { Maybe, TrxOrDb } from '../../types.ts'

export function ensureDoctorId(trx: TrxOrDb, doctor_id: Maybe<string>) {
  return doctor_id && (
    trx.selectFrom('employment')
      .where('id', '=', doctor_id)
      .where('profession', '=', 'doctor')
      .select('id')
  )
}
