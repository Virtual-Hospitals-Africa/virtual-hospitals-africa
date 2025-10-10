import { FreshContext } from '$fresh/server.ts'
import { LoggedInHealthWorker } from '../types.ts'
import redirect from '../util/redirect.ts'

// deno-lint-ignore require-await
export default async function AppRedirectToWaitingRoomPage(
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  return redirect(
    `/app/organizations/${ctx.state.health_worker.default_organization_id}/waiting_room`,
  )
}
