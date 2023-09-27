import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { EmployedHealthWorker, TrxOrDb } from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'
import { assertOr403 } from '../../util/assertOr.ts'
import { assert } from 'std/testing/asserts.ts'

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<
    WithSession & {
      trx: TrxOrDb
      healthWorker: EmployedHealthWorker
    }
  >,
) {
  const health_worker_id = ctx.state.session.get('health_worker_id')
  assert(health_worker_id)
  const healthWorker = await health_workers.get(ctx.state.trx, {
    health_worker_id,
  })

  assertOr403(health_workers.isEmployed(healthWorker))
  ctx.state.healthWorker = healthWorker

  const roleNeedingRegistration = healthWorker.employment.find((e) =>
    e.roles.nurse.registration_needed || e.roles.doctor.registration_needed ||
    e.roles.admin.registration_needed
  )

  const rolePendingApproval = healthWorker.employment.find((e) =>
    e.roles.nurse.registration_pending_approval ||
    e.roles.doctor.registration_pending_approval ||
    e.roles.admin.registration_pending_approval
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
