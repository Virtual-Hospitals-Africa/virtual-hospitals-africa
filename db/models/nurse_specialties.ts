import { NurseSpeciality, TrxOrDb } from '../../types.ts'

export function add(
  trx: TrxOrDb,
  opts: {
    employee_id: number
    speciality: NurseSpeciality
  },
) {
  return trx
    .insertInto('nurse_specialities')
    .values(opts)
    .execute()
}
