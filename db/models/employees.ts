import {
  HealthWorkerOrganization,
  IdSelection,
  RenderedEmployee,
  TrxOrDb,
} from '../../types.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import * as health_workers from './health_workers.ts'
import { healthWorkerIdOfEmploymentId } from './health_worker_id.ts'
import { exists } from '../../util/exists.ts'
import healthWorkerDisplay from '../../util/healthWorkerDisplay.ts'

export async function getById(
  trx: TrxOrDb,
  employee_id: string | IdSelection,
): Promise<RenderedEmployee> {
  const health_worker_id = healthWorkerIdOfEmploymentId(
    trx,
    employee_id,
  )

  const { health_worker, organization } = await promiseProps({
    health_worker: health_workers.getEmployed(trx, {
      health_worker_id,
    }),
    organization: trx.selectFrom(
      'employment as health_worker_employment',
    )
      .where('health_worker_employment.id', '=', employee_id)
      .select('organization_id as id')
      .executeTakeFirstOrThrow(),
  })

  const organization_employment: HealthWorkerOrganization = exists(
    health_worker.organizations.find((o) => {
      o.id === organization.id
    }),
  )

  const display = healthWorkerDisplay(
    health_worker.name,
    organization_employment,
  )

  return {
    health_worker,
    organization_employment,
    display,
  }
}
