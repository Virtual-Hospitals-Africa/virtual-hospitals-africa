import { FreshContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { EmployedHealthWorker, TrxOrDb } from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'

export async function handler(
  req: Request,
  ctx: FreshContext<
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

  if (!health_workers.isEmployed(healthWorker)) {
    ctx.state.session.clear()
    const warning = encodeURIComponent(
      "Could not locate your account. Please try logging in once more. If this issue persists, please contact your facility's administrator.",
    )
    return redirect(`/?warning=${warning}`)
  }
  ctx.state.healthWorker = healthWorker

  const role_needing_registration = healthWorker.employment.find((e) =>
    e.roles.nurse?.registration_needed || e.roles.doctor?.registration_needed ||
    e.roles.admin?.registration_needed
  )

  // This is not quite right as this will mean that you can't log in if you're pending approval at one facility, even if you're not
  // pending approval at another but not at another.
  // TODO deal with this as part of doctor registration
  const role_pending_approval = healthWorker.employment.find((e) =>
    e.roles.nurse?.registration_pending_approval ||
    e.roles.doctor?.registration_pending_approval ||
    e.roles.admin?.registration_pending_approval
  )

  const availability_not_set = healthWorker.employment.find((e) =>
    !e.availability_set
  )

  function redirectIfNotAlreadyOnPage(
    page: string,
    params?: Record<string, string>,
  ) {
    const current_url = ctx.url.pathname + ctx.url.search
    console.log('current_url', current_url)
    const on_page = current_url.startsWith(page)
    console.log('on_page', on_page, page)
    return on_page
      ? ctx.next()
      : redirect(params ? `${page}?${new URLSearchParams(params)}` : page)
  }

  if (role_needing_registration) {
    return redirectIfNotAlreadyOnPage(
      `/app/facilities/${role_needing_registration.facility.id}/register`,
    )
  }

  // TODO make a page for this purpose
  if (role_pending_approval) {
    return redirectIfNotAlreadyOnPage('/app/pending_approval')
  }

  if (availability_not_set) {
    return redirectIfNotAlreadyOnPage(
      '/app/calendar/availability',
      {
        facility_id: String(availability_not_set.facility.id),
        initial: 'true',
        warning:
          'Please set your availability to be able to receive appointments',
      },
    )
  }

  return ctx.next()
}
