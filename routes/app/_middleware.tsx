import { redisSession } from 'fresh_session'
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

    const state = getApprovalState(employmentDetails, nurseDetails, req)
    console.log(state)

    switch (state.approval) {
      case 'unauthorized':
        return new Response('Unauthorized', { status: 401 })
      case 'approved':
      case 'registering':
        return ctx.next()
      case 'needRegistration':
        return redirect(
          `/app/facilities/${state.facilityId}/register`,
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

function getApprovalState(
  employmentDetails: ReturnedSqlRow<Employee>[] | undefined,
  nurseDetails: NurseRegistrationDetails | undefined,
  req: Request,
) {
  if (!employmentDetails) return { approval: 'unauthorized' }

  for (const employee of employmentDetails) {
    console.log(employee)
    if (employee.profession === 'nurse') {
      if (!nurseDetails) {
        if (
          req.url.includes(`/app/facilities/${employee.facility_id}/register`)
        ) {
          return { approval: 'registering', facilityId: employee.facility_id }
        } else {return {
            approval: 'needRegistration',
            facilityId: employee.facility_id,
          }}
      } else if (!nurseDetails?.approved_by) {
        return { approval: 'needApproval', facilityId: employee.facility_id }
      } else return { approval: 'approved', facilityId: employee.facility_id }
    }
  }

  if (
    employmentDetails?.find(({ profession }) => {
      return profession === 'nurse' || profession === 'admin'
    })
  ) {
    return { approval: 'approved' }
  }

  return { approval: 'unauthorized' }
}
