import redirect from "../util/redirect.ts"
import {
  Facility,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
  TrxOrDb
} from '../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import { oauthParams } from '../external-clients/google.ts'
import db, { DatabaseSchema } from '../db/db.ts'
import { Kysely } from "kysely"
import { addInvite } from "../db/models/health_workers.ts"


type AcceptInvitePageProps = {
  isAdmin: boolean
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

async function isCorrectCode(inviteCode: string | null, email: string): Promise<boolean> {
  if (!inviteCode) return false; 
  const res = await db.selectFrom('invites')
    .selectAll()
    .where('email', '=' , email)
    .where('invite_code', '=', inviteCode)
    .execute()
  return res.length === 1
}

/*
async function addToHealthWorkerAndEmploymentTable(
  trx: TrxOrDb,
  healthWorker: HealthWorkerWithGoogleTokens, // session data
) {
  // Start a transaction
  await trx
      .insertInto('health_worker_invitees')
      .values({[]
        email: healthWorker.email, 
        facility_id: healthWorker.facility_id,
        profession: healthWorker.profession        
      })
      .executeTakeFirst();

    // Insert the employment relationship into the `employment` table
  await trx
      .insertInto('employment')
      .values({
        health_worker_id: insertedHealthWorker.id,
        facility_id: facilityId,
        profession: profession
      })
      .execute();
  }
  */

export const handler: LoggedInHealthWorkerHandler<AcceptInvitePageProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data
    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    if (!isHealthWorkerWithGoogleTokens(healthWorker)) return redirect(loginUrl) 
    const url = new URL(req.url);
    const invite_code = url.searchParams.get("inviteCode");

    if (await isCorrectCode(invite_code, ctx.state.session.data.email)) {
      //await addToHealthWorkerAndEmploymentTable(ctx.state.trx, ctx.state.session.data)
      return redirect('/app')
    } else {
      throw new Error('Our princess is in another castle')
    }
  },
}

