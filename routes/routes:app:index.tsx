import { Context } from 'fresh'
import { LoggedInHealthWorker } from '../types.ts'
import redirect from '../util/redirect.ts'

export default function AppRedirectToWaitingRoomPage(
  ctx: Context<LoggedInHealthWorker>,
) {
  return redirect(
    `/app/organizations/${ctx.state.health_worker.default_organization_id}/waiting_room`,
  )
}
