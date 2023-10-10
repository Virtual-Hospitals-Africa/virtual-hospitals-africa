import { NurseSpecialty, TrxOrDb } from '../../types.ts'

export function add(
  trx: TrxOrDb,
  opts: {
    employee_id: number
    specialty: NurseSpecialty
  },
) {
  return trx
    .insertInto('nurse_specialties')
    .values(opts)
    .execute()
}
