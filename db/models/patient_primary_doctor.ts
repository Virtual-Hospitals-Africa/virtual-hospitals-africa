import { TrxOrDb } from '../../types.ts'
import * as employees from './employees.ts'

// TODO unregistered primary doctor
export function get(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return employees.baseQuery(trx)
    .where(
      'employment.id',
      '=',
      trx.selectFrom('patients')
        .where('id', '=', patient_id)
        .select('primary_doctor_id'),
    )
    .executeTakeFirst()
}
