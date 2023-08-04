import { Handlers } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { assert } from 'std/testing/asserts.ts'
import { getInitialTokensFromAuthCode } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as employment from '../db/models/employment.ts'
import * as google from '../external-clients/google.ts'
import {
  GoogleProfile,
  HealthWorker,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../types.ts'

export async function initializeHealthWorker(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  profile: GoogleProfile,
  invitees: { id: number; facility_id: number; profession: Profession }[],
): Promise<ReturnedSqlRow<HealthWorker>> {
  const calendars = await googleClient
    .ensureHasAppointmentsAndAvailabilityCalendars()

  const healthWorker = await health_workers.upsertWithGoogleCredentials(trx, {
    name: profile.name,
    email: profile.email,
    avatar_url: profile.picture,
    gcal_appointments_calendar_id: calendars.vhaAppointmentsCalendar.id,
    gcal_availability_calendar_id: calendars.vhaAvailabilityCalendar.id,
    access_token: googleClient.tokens.access_token,
    refresh_token: googleClient.tokens.refresh_token,
    expires_at: googleClient.tokens.expires_at,
  })

  await employment.add(
    trx,
    invitees.map((invitee) => ({
      health_worker_id: healthWorker.id,
      facility_id: invitee.facility_id,
      profession: invitee.profession,
    })),
  )

  await employment.removeInvitees(trx, invitees.map((invitee) => invitee.id))

  return healthWorker
}

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(req, ctx) {
    const { session } = ctx.state
    const code = new URL(req.url).searchParams.get('code')

    assert(code, 'No code found in query params')

    const gettingTokens = getInitialTokensFromAuthCode(code)

    const authorized = await db.transaction().execute(async (trx) => {
      const tokens = await gettingTokens

      const googleClient = new google.GoogleClient(tokens)
      const profile = await googleClient.getProfile()

      const invitees = await employment.getInvitees(trx, {
        email: profile.email,
      })

      const healthWorker = await (
        invitees.length
          ? initializeHealthWorker(
            trx,
            googleClient,
            profile,
            invitees,
          )
          : health_workers.updateTokens(trx, profile.email, tokens)
      )

      if (!healthWorker) return false

      for (
        const [key, value] of Object.entries({ ...healthWorker, ...tokens })
      ) {
        session.set(key, value)
      }

      return true
    })

    return authorized
      ? redirect('/app')
      : new Response('Not authorized', { status: 401 })
  },
}
