import { TrxOrDb } from '../../types.ts'
import { employees } from './employees.ts'

export const patient_primary_doctor = {
  // TODO unregistered primary doctor
  get(
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
  },
}
