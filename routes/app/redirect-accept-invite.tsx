import { getInviteCode, getInvitee } from '../../db/models/health_workers.ts'
import {
  HealthWorkerInvitee,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
} from '../../types.ts'
import { PageProps } from '$fresh/server.ts'
import { addToEmploymentTable } from '../../util/helper.ts'
import InviteConfirmation from '../app/invite-confirmation.tsx'
import { assert } from 'std/_util/asserts.ts'
import { assertEquals } from 'std/testing/asserts.ts'

type RedirectedAcceptInvitePageProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  invite: HealthWorkerInvitee
}

export const handler: LoggedInHealthWorkerHandler<
  RedirectedAcceptInvitePageProps
> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data

    const inviteCodeFromSession = ctx.state.session.get('inviteCode')

    assert(inviteCodeFromSession)
    const inviteCodeFromDB = await getInviteCode(
      ctx.state.trx,
      healthWorker.email,
    )
    assertEquals(inviteCodeFromSession, inviteCodeFromDB)

    const invite = await getInvitee(ctx.state.trx, {
      inviteCode: inviteCodeFromSession,
      email: ctx.state.session.data.email,
    })

    assert(invite)
    await addToEmploymentTable(ctx.state.trx, healthWorker, invite)
    return ctx.render({ healthWorker, invite })
  },
}

export default function acceptInvite(
  props: PageProps<RedirectedAcceptInvitePageProps>,
) {
  return <InviteConfirmation />
}
