import { NurseSpecialty, TrxOrDb } from '../../types.ts'

export function add(
  trx: TrxOrDb,
  opts: {
    employee_id: string
    specialty: NurseSpecialty
  },
) {
  return trx
    .insertInto('nurse_specialties')
    .values(opts)
    .execute()
}
