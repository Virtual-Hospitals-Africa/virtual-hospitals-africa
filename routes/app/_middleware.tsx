import { redisSession } from 'fresh_session'
import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { NurseRegistrationDetails, TrxOrDb } from '../../types.ts'
import * as employment from '../../db/models/employment.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import { isHealthWorkerWithGoogleTokens } from '../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import redirect from '../../util/redirect.ts'
import { Employee } from '../../types.ts'
import EmployeeTable from './facilities/[facilityId]/employees.tsx'

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
    const nurseDetails = await details.getDetails(trx, {
      healthWorkerId: healthWorker.id,
    })

    if (
      ctx.state.session.get('isRegistering') &&
      req.url.includes(
        `/app/facilities/${employmentDetails?.at(0)?.facility_id}/register`,
      )
    ) return ctx.next()

    let approvalState = 'unauthorized'

    employmentDetails?.every((employee) => {
      switch (employee.profession) {
        case 'admin' || 'doctor':
          approvalState = 'approved'
          return false
        case 'nurse':
          if (!nurseDetails) {
            approvalState = 'needRegistration'
          } else if (!nurseDetails?.approved_by) {
            approvalState = 'needApproval'
          } else {
            approvalState = 'approved'
            return false
          }
      }
      return true
    })

    switch (approvalState) {
      case 'unauthorized':
        return new Response('Unauthorized', { status: 401 })
      case 'approved':
        return ctx.next()
      case 'needRegistration':
        ctx.state.session.set('isRegistering', true)
        return redirect(
          `/app/facilities/${employmentDetails?.at(0)?.facility_id}/register`,
        )
      case 'needApproval':
        return new Response('Please wait unitl details approved by admin', {
          status: 401,
        })
      default:
        return new Response('Unauthorized', { status: 401 })
    }
  },
]
