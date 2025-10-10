import { TrxOrDb } from '../../types.ts'

export function healthWorkerIdOfEmploymentId(
  trx: TrxOrDb,
  employment_id: string,
) {
  return trx.selectFrom('employment as health_worker_employment')
    .select('health_worker_id')
    .where('health_worker_employment.id', '=', employment_id)
}

export type HealthWorkerIdSelection = ReturnType<
  typeof healthWorkerIdOfEmploymentId
>
