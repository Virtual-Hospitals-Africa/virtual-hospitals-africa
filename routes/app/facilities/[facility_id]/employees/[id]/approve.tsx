import { assert } from 'std/assert/assert.ts'
import { approveInvitee } from '../../../../../../db/models/employment.ts'
import {
  Facility,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../../../types.ts'
import { assertOr404 } from '../../../../../../util/assertOr.ts'

import * as health_workers from '../../../../../../db/models/health_workers.ts'
import redirect from '../../../../../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandler<
  { facility: ReturnedSqlRow<Facility>; isAdminAtFacility: boolean }
> = {
  async POST(_, ctx) {
    console.log('hello there')
    // get facility id
    const facility_id = parseInt(ctx.params.facility_id)
    assert(!isNaN(facility_id), 'Invalid facility ID')

    // get health worker id
    const health_worker_id = parseInt(ctx.params.id)
    assert(!isNaN(health_worker_id), 'Invalid health worker ID')

    const employee = await health_workers.getEmployeeInfo(
      ctx.state.trx,
      health_worker_id,
      facility_id,
    )
    assertOr404(
      employee,
      `Health worker ${health_worker_id} not found.`,
    )

    await approveInvitee(
      ctx.state.trx,
      ctx.state.healthWorker.id,
      health_worker_id,
    )
    console.log('approved!')

    const success = `Successfully approved ${employee.name}`

    return redirect(
      `/app/facilities/${facility_id}/employees?success=${success}`,
    )
  },
}
