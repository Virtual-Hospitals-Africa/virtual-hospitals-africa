import { IdSelection, TrxOrDb } from '../../types.ts'

export function healthWorkerIdOfEmploymentId(
  trx: TrxOrDb,
  employment_id: string,
): IdSelection {
  return trx.selectFrom('employment as health_worker_employment')
    .where('health_worker_employment.id', '=', employment_id)
    .select('health_worker_id as id')
}
