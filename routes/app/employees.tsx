import { assert } from 'std/testing/asserts.ts'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import redirect from '../../util/redirect.ts'

type EmployeesPageProps = {
  isAdmin: boolean
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<EmployeesPageProps> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const facility_id = await employment.getFirstFacility(
      ctx.state.trx,
      { employeeId: healthWorker.id },
    )
    assert(facility_id, 'User not employed at any facility')
    return redirect(`/app/facilities/${facility_id}/employees`)
  },
}
