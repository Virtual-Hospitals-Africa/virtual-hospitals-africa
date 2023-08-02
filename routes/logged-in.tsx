import { Handlers } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { assert } from 'std/testing/asserts.ts'
import { getInitialTokensFromAuthCode } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as google from '../external-clients/google.ts'
import { GoogleTokens, HealthWorker, ReturnedSqlRow } from '../types.ts'

export async function initializeHealthWorker(
  tokens: GoogleTokens,
): Promise<ReturnedSqlRow<HealthWorker>> {
  const googleClient = new google.GoogleClient(tokens)

  const gettingProfile = googleClient.getProfile()
  const gettingCalendars = googleClient
    .ensureHasAppointmentsAndAvailabilityCalendars()

  const profile = await gettingProfile
  const calendars = await gettingCalendars

  return health_workers.upsertWithGoogleCredentials(db, {
    name: profile.name,
    email: profile.email,
    avatar_url: profile.picture,
    gcal_appointments_calendar_id: calendars.vhaAppointmentsCalendar.id,
    gcal_availability_calendar_id: calendars.vhaAvailabilityCalendar.id,
    access_token: googleClient.tokens.access_token,
    refresh_token: googleClient.tokens.refresh_token,
    expires_at: googleClient.tokens.expires_at,
  })
}

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(req, ctx) {
    const { session } = ctx.state
    const code = new URL(req.url).searchParams.get('code')

    assert(code, 'No code found in query params')

    const tokens = await getInitialTokensFromAuthCode(code)
    const googleClient = new google.GoogleClient(tokens)
    const profile = await googleClient.getProfile()
    const isHealthWorker = await health_workers.isHealthWorker(
      db,
      profile.email,
    ) || await health_workers.getInvitee(
      db,
      {
        email: profile.email,
      },
    )

    const invite_code = await session.get('inviteCode')
    const isAuthed = isHealthWorker || invite_code
    if (!isAuthed) return new Response('Please contact adminto invite you.')

    //initialize it in the case there is no google credentials registered.
    const health_worker = await initializeHealthWorker(tokens)
    for (
      const [key, value] of Object.entries({ ...health_worker, ...tokens })
    ) {
      session.set(key, value)
    }

    session.set('inviteCode', undefined)

    return redirect(
      invite_code ? '/app/redirect-accept-invite' : '/app',
    )
  },
}
