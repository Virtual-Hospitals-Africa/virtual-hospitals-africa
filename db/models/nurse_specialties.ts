import {
  NurseSpeciality,
  ReturnedSqlRow,
  Specialities,
  TrxOrDb,
} from '../../types.ts'

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

export function getByHealthWorker(
  trx: TrxOrDb,
  opts: {
    health_worker_id: number
  },
): Promise<ReturnedSqlRow<Specialities>[]> {
  return trx.selectFrom('nurse_specialities')
    .where('employee_id', '=', opts.health_worker_id)
    .selectAll()
    .execute()
}
