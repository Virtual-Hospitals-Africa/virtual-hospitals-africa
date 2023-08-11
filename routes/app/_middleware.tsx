import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import {
  NurseRegistrationDetails,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import * as employment from '../../db/models/employment.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import { isHealthWorkerWithGoogleTokens } from '../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import redirect from '../../util/redirect.ts'
import { Employee } from '../../types.ts'
import { HealthWorkerWithRegistrationState } from '../../db/models/employment.ts'

export const handler = [
  async (
    req: Request,
    ctx: MiddlewareHandlerContext<
      WithSession & {
        trx: TrxOrDb
      }
    >,
  ) => {
    const { trx } = ctx.state
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const employmentDetails = await employment.getByHealthWorker(trx, {
      health_worker_id: healthWorker.id,
    })
    const nurseDetails = await details.get(trx, {
      healthWorkerId: healthWorker.id,
    })

    const state = getApprovalState(employmentDetails, req)
    console.log(state)

    switch (state.approval) {
      case 'unauthorized':
        return new Response('Unauthorized', { status: 401 })
      case 'approved':
      case 'registering':
        return ctx.next()
      case 'registrationNeeded':
        return redirect(
          `/app/facilities/${state.facilityId}/register`,
        )
      case 'pendingApproval':
        return new Response('Please wait unitl details approved by admin', {
          status: 401,
        })
      default:
        return new Response('Unauthorized', { status: 401 })
    }
  },
]

function getApprovalState(
  employmentDetails: HealthWorkerWithRegistrationState[],
  req: Request,
) {
  for (const employee of employmentDetails) {
    if (employee.registration_needed) {
      if (
        req.url.includes(`/app/facilities/${employee.facility_id}/register`)
      ) return { approval: 'registering' }
      else {return {
          approval: 'registrationNeeded',
          facilityId: employee.facility_id,
        }}
    }
    if (employee.registration_pending_approval) {
      return { approval: 'pendingApproval' }
    }
  }

  if (
    employmentDetails?.find((employee) => {
      return employee.profession === 'nurse' ||
        employee.profession === 'admin' ||
        employee.registration_completed
    })
  ) {
    return { approval: 'approved' }
  }

  return { approval: 'unauthorized' }
}
