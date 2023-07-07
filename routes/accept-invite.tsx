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
import { Kysely } from "kysely"

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

interface HealthWorker {
  name: string;
  email: string;
  avatar_url: string;
  gcal_appointments_calendar_id?: string;
  gcal_availability_calendar_id?: string;
}

/*
async function addToHealthWorkerAndEmploymentTable(
  db: Kysely<unknown>,
  healthWorker: HealthWorker,
  facilityId: number,
  profession: 'admin' | 'doctor' | 'nurse'
) {
  // Start a transaction
  await db.transaction(async (trx) => {
    // Insert the health worker into the `health_workers` table and get the inserted id
    const insertedHealthWorker = await trx
      .insertInto('health_workers')
      .values({
        ...healthWorker, 
        created_at: trx.raw('now()'), 
        updated_at: trx.raw('now()')
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
  });
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