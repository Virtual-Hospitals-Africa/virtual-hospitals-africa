import { Context } from 'fresh'
import { LoggedInHealthWorker } from '../../types.ts'
import redirect from '../../util/redirect.ts'
import { defaultOrganizationId } from '../../shared/defaultOrganizationId.ts'

export const handler = function AppRedirectToWaitingRoomPage(
  ctx: Context<LoggedInHealthWorker>,
) {
  const { state, url } = ctx
  return redirect(
    `/app/organizations/${defaultOrganizationId(state.health_worker)}/waiting_room`,
    url.searchParams,
  )
}
