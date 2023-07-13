import redirect from '../../../../util/redirect.ts'
import {
  HealthWorkerInvitee,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  TrxOrDb,
} from '../../../../types.ts'
import {
  addEmployee,
  getInvitee,
  isHealthWorkerWithGoogleTokens,
  upsert,
} from '../../../../db/models/health_workers.ts'
import { oauthParams } from '../../../../external-clients/google.ts'
import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'

type AcceptInvitePageProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  invite: HealthWorkerInvitee
}

export const handler: LoggedInHealthWorkerHandler<AcceptInvitePageProps> = {
  async GET(req, ctx) {
    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)

    const healthWorker = ctx.state.session.data
    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`

    if (!isHealthWorkerWithGoogleTokens(healthWorker)) return redirect(loginUrl)
    const url = new URL(req.url)
    const invite_code = url.searchParams.get('inviteCode')
    assert(invite_code)
    console.log(invite_code)

    const invite = await getInvitee(ctx.state.trx, {
      inviteCode: invite_code,
      email: ctx.state.session.data.email,
    })

    assert(invite)

    if (invite.facility_id !== facilityId) {
      throw new Error(
        `the path facilityId of ${facilityId} does not equal the invite facility id of ${invite.facility_id}`,
      )
    }

    addToHealthWorkerAndEmploymentTable(ctx.state.trx, healthWorker, invite)

    return ctx.render({ healthWorker, invite })
  },
}

export async function addToHealthWorkerAndEmploymentTable(
  trx: TrxOrDb,
  healthWorker: HealthWorkerWithGoogleTokens,
  invite: HealthWorkerInvitee,
) {
  //TODO: check whether the healthworker already exists, and just add to employmnet table if so
  /*
  assert(
    await upsert(trx, {
      name: healthWorker.name,
      email: healthWorker.email,
      avatar_url: healthWorker.avatar_url,
      gcal_appointments_calendar_id: healthWorker.gcal_appointments_calendar_id,
      gcal_availability_calendar_id: healthWorker.gcal_availability_calendar_id,
    }),
  )
  */

  assert(
    await addEmployee(trx, {
      employee: {
        health_worker_id: healthWorker.id,
        profession: invite.profession,
        facility_id: invite.facility_id,
      },
    }),
  )
}

export default function acceptInvite(
  props: PageProps<AcceptInvitePageProps>,
) {
  return <h1>TODO the invite page</h1>
}
