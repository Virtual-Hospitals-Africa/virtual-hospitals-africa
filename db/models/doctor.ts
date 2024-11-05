import type { TrxOrDb } from '../../types.ts'

export function ensureDoctorId(
  trx: TrxOrDb,
  doctor_id: string,
) {
  return trx.selectFrom('employment')
    .where('id', '=', doctor_id)
    .where('profession', '=', 'doctor')
    .select('id')
}
