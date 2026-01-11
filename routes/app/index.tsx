import { Context } from 'fresh'
import { LoggedInHealthWorker } from '../../types.ts'
import redirect from '../../util/redirect.ts'
import { defaultOrganizationId } from '../../shared/defaultOrganizationId.ts'

export const handler = function AppRedirectToWaitingRoomPage(
  { state }: Context<LoggedInHealthWorker>,
) {
  return redirect(
    `/app/organizations/${defaultOrganizationId(state.health_worker)}/waiting_room`,
  )
}
