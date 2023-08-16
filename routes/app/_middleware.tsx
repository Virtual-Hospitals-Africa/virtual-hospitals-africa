import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { TrxOrDb } from '../../types.ts'
import * as employment from '../../db/models/employment.ts'
import { isHealthWorkerWithGoogleTokens } from '../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import redirect from '../../util/redirect.ts'

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<
    WithSession & {
      trx: TrxOrDb
    }
  >,
) {
  const { trx } = ctx.state
  const healthWorker = ctx.state.session.data
  assert(isHealthWorkerWithGoogleTokens(healthWorker))

  const roles = await employment.getByHealthWorker(trx, {
    health_worker_id: healthWorker.id,
  })

  const roleNeedingRegistration = roles.find(
    (employee) => employee.registration_needed,
  )
  const rolePendingApproval = roles.find(
    (employee) => employee.registration_pending_approval,
  )
  if (roleNeedingRegistration) {
    const registrationPage =
      `/app/facilities/${roleNeedingRegistration.facility_id}/register`

    const url = new URL(req.url)
    const onRegistrationPage = url.pathname === registrationPage
    return onRegistrationPage ? ctx.next() : redirect(registrationPage)
  }

  // TODO make a page for this purpose
  if (rolePendingApproval) {
    const pendingApprovalPage = '/app/pending-approval'
    const url = new URL(req.url)
    const onPendingApprovalPage = url.pathname === pendingApprovalPage
    return onPendingApprovalPage ? ctx.next() : redirect(pendingApprovalPage)
  }
  return ctx.next()
}
