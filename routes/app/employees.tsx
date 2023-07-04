import { assert } from 'std/testing/asserts.ts'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'

type EmployeesPageProps = {
  isAdmin: boolean
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<EmployeesPageProps> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      health_workers.isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )
    const facilityId = await health_workers.getFirstEmployedFacility(
      ctx.state.trx,
      { employeeId: healthWorker.id },
    )
    if (!facilityId) {
      throw new Error('User not employed at any facility')
    }
    return redirect('facilities/' + facilityId + '/employees')
  },
}
