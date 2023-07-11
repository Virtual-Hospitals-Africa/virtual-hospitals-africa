import redirect from '../../../util/redirect.ts'
import {
  Facility,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import { oauthParams } from '../../../external-clients/google.ts'
import { addHealthWorker } from '../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'

type AcceptInvitePageProps = {
  isAdmin: boolean
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

async function isCorrectCode(
  trx: TrxOrDb,
  inviteCode: string | null,
  email: string,
): Promise<boolean> {
  if (!inviteCode) return false
  const res = await trx.selectFrom('health_worker_invitees')
    .selectAll()
    .where('email', '=', email)
    .where('invite_code', '=', inviteCode)
    .execute()
  console.log('length is ' + res.length)
  return res.length === 1
}

export async function addToHealthWorkerAndEmploymentTable(
  trx: TrxOrDb,
  healthWorker: HealthWorkerWithGoogleTokens,
) {
  const Response = await
  addHealthWorker(trx, {
    name: healthWorker.name,
    email: healthWorker.email,
    avatar_url: healthWorker.avatar_url,
    gcal_appointments_calendar_id: healthWorker.gcal_appointments_calendar_id,
    gcal_availability_calendar_id: healthWorker.gcal_availability_calendar_id,
  })

  const healthWorkerId = await trx
    .selectFrom('health_workers')
    .select('id')
    .where('email', '=', healthWorker.email)
    .executeTakeFirst()

  const inviteeData = await trx
    .selectFrom('health_worker_invitees')
    .select(['facility_id', 'profession'])
    .where('email', '=', healthWorker.email)
    .executeTakeFirst()

  assert(healthWorkerId != undefined)
  assert(inviteeData != undefined)

  await trx.insertInto('employment')
    .values({
      health_worker_id: healthWorkerId.id,
      facility_id: inviteeData.facility_id,
      profession: inviteeData.profession,
    })
    .executeTakeFirst()
}

export const handler: LoggedInHealthWorkerHandler<AcceptInvitePageProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data
    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    if (!isHealthWorkerWithGoogleTokens(healthWorker)) return redirect(loginUrl)
    const url = new URL(req.url)
    const pathname = url.pathname
    const parts = pathname.split('/')
    const invite_code = parts[2]
    if (
      await isCorrectCode(
        ctx.state.trx,
        invite_code,
        ctx.state.session.data.email,
      )
    ) {
      await addToHealthWorkerAndEmploymentTable(
        ctx.state.trx,
        ctx.state.session.data,
      )
      return redirect('/app')
    } else {
      throw new Error('Our princess is in another castle')
    }
  },
}
