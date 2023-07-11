import redirect from '../../../../util/redirect.ts'
import {
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  TrxOrDb,
  health_worker_invitee,
  HealthWorker
} from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import { oauthParams } from '../../../../external-clients/google.ts'
import { 
  addHealthWorker,
  getInvitee,
  addEmployee
} from '../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import { PageProps } from 'https://deno.land/x/fresh@1.2.0/server.ts'

type AcceptInvitePageProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  invite: health_worker_invitee
}

export const handler: LoggedInHealthWorkerHandler<AcceptInvitePageProps> = {
  async GET(req, ctx) {
    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)

    const healthWorker = ctx.state.session.data
    const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`

    if (!isHealthWorkerWithGoogleTokens(healthWorker)) return redirect(loginUrl)
    const url = new URL(req.url)
    const invite_code = url.searchParams.get('inviteCode')
    console.log(invite_code);
    assert(invite_code)

    const invite = await getInvitee(ctx.state.trx, {inviteCode: invite_code, email: ctx.state.session.data.email})
    assert(invite)
    if (invite.facility_id !== facilityId) {
      throw new Error(`the path facilityId of ${facilityId} does not equal the invite facility id of ${invite.facility_id}`)
    }
    return ctx.render({healthWorker, invite})
  },
}

async function addToHealthWorkerAndEmploymentTable(
  trx: TrxOrDb,
  healthWorker: HealthWorkerWithGoogleTokens,
  invite: health_worker_invitee
) {
  assert(await addHealthWorker(trx, {healthWorker}))
  
  assert(await addEmployee(trx, {
    employee: {
      health_worker_id: healthWorker.id,
      profession: invite.profession,
      facility_id: invite.facility_id
    }
  }))
}

export default function EmployeeInvite (
  props: PageProps<AcceptInvitePageProps>
) {
  console.log("props", props)
  return (
    <h1>TODO</h1>
  )
}


