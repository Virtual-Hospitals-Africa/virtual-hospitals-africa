import redirect from "../util/redirect.ts"
import {
  Facility,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import { oauthParams } from '../external-clients/google.ts'
import db from '../db/db.ts'

type AcceptInvitePageProps = {
  isAdmin: boolean
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

async function isCorrectCode(inviteCode: string | null, email: string): Promise<boolean> {
  if (!inviteCode) return false; // if inviteCode is null or undefined, return false

  const res = await db.selectFrom('invites')
    .selectAll()
    .where('email', '=' , email)
    .where('invite_code', '=', inviteCode)
    .execute()
  return res.length === 1; // if length is greater than 0, it means there is a match in the database
}
export const handler: LoggedInHealthWorkerHandler<AcceptInvitePageProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data
    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
		if (!isHealthWorkerWithGoogleTokens(healthWorker)) return redirect(loginUrl) 
    const url = new URL(req.url);
    const invite_code = url.searchParams.get("inviteCode");

    if (await isCorrectCode(invite_code, ctx.state.session.data.email)) {
      // await addToHealthWorkerAndEmploymentTable(ctx.state.trx, ctx.state.session.data)
      return redirect('/app')
    } else {
      throw new Error('Our princess is in another castle')
    }
  },
}