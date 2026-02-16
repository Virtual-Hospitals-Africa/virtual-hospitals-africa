import { IdSelection, TrxOrDbOrQueryCreator } from '../../types.ts'

export function healthWorkerIdOfEmploymentId(
  trx: TrxOrDbOrQueryCreator,
  employment_id: string | IdSelection,
): IdSelection {
  return trx.selectFrom('employment as health_worker_employment')
    .where('health_worker_employment.id', '=', employment_id)
    .select('health_worker_id as id')
}
