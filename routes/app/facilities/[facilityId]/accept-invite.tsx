import redirect from '../../../../util/redirect.ts'
import {
  HealthWorkerInvitee,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
} from '../../../../types.ts'
import {
  getInvitee,
  isHealthWorkerWithGoogleTokens,
} from '../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import { redis } from '../../../../external-clients/redis.ts'
import generateUUID from '../../../../util/uuid.ts'
import { PageProps } from '$fresh/server.ts'
import { addToHealthWorkerAndEmploymentTable } from '../../../../util/helper.ts'
import InviteConfirmation from '../../../../routes/app/invite-confirmation.tsx'

type AcceptInvitePageProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  invite: HealthWorkerInvitee
}

export const sessionId = generateUUID()

export const handler: LoggedInHealthWorkerHandler<AcceptInvitePageProps> = {
  async GET(req, ctx) {
    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)

    const url = new URL(req.url)
    const inviteCode = url.searchParams.get('inviteCode')
    assert(inviteCode)

    await redis.set(sessionId, inviteCode)

    const healthWorker = ctx.state.session.data
    if (!isHealthWorkerWithGoogleTokens(healthWorker)) {
      return redirect(`/app/redirect-login`)
    }

    const invite = await getInvitee(ctx.state.trx, {
      inviteCode: inviteCode,
      email: ctx.state.session.data.email,
    })

    assert(invite)

    if (invite.facility_id !== facilityId) {
      throw new Error(
        `the path facilityId of ${facilityId} does not equal the invite facility id of ${invite.facility_id}`,
      )
    }

    //set invite code to redis so I can call it again in the registration
    ctx.state.session.set('inviteCode', inviteCode)

    addToHealthWorkerAndEmploymentTable(ctx.state.trx, healthWorker, invite)

    return ctx.render({ healthWorker, invite })
  },
}

export default function acceptInvite(props: PageProps<AcceptInvitePageProps>) {
  return <InviteConfirmation />
}
