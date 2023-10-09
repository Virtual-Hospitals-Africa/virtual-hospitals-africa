import {
  NurseSpecialty,
  ReturnedSqlRow,
  Specialties,
  TrxOrDb,
} from '../../types.ts'

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

export function getByHealthWorker(
  trx: TrxOrDb,
  opts: {
    health_worker_id: number
  },
): Promise<ReturnedSqlRow<Specialties>[]> {
  return trx.selectFrom('nurse_specialties')
    .where('employee_id', '=', opts.health_worker_id)
    .selectAll()
    .execute()
}
