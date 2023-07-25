import { redis } from '../../external-clients/redis.ts'
import { getInviteCode, getInvitee } from '../../db/models/health_workers.ts'
import {
  HealthWorkerInvitee,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
} from '../../types.ts'
import { PageProps } from '$fresh/server.ts'
import { addToHealthWorkerAndEmploymentTable } from '../../util/helper.ts'
import InviteConfirmation from '../app/invite-confirmation.tsx'
import { sessionId } from '../../routes/accept-invite/[inviteCode].tsx'

type RedirectedAcceptInvitePageProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  invite: HealthWorkerInvitee
}

export const handler: LoggedInHealthWorkerHandler<
  RedirectedAcceptInvitePageProps
> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data

    const inviteCodeFromSession = await redis.get(sessionId)

    if (inviteCodeFromSession) {
      const inviteCodeFromDB = await getInviteCode(
        ctx.state.trx,
        healthWorker.email,
      )
      if (inviteCodeFromSession === inviteCodeFromDB) {
        const invite = await getInvitee(ctx.state.trx, {
          inviteCode: inviteCodeFromSession,
          email: ctx.state.session.data.email,
        })
        addToHealthWorkerAndEmploymentTable(ctx.state.trx, healthWorker, invite)
        return ctx.render({ healthWorker, invite })
      } else {
        throw new Error('Invalid invite code.')
      }
    } else {
      throw new Error('No invite code in session')
    }
  },
}

export default function acceptInvite(
  props: PageProps<RedirectedAcceptInvitePageProps>,
) {
  return <InviteConfirmation />
}
