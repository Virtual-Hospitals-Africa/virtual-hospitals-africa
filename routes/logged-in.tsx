import { Handlers } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { assert } from 'std/assert/assert.ts'
import { getInitialTokensFromAuthCode } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as employment from '../db/models/employment.ts'
import * as facilities from '../db/models/facilities.ts'
import * as google from '../external-clients/google.ts'
import {
  EmployedHealthWorker,
  GoogleProfile,
  Profession,
  TrxOrDb,
} from '../types.ts'
import uniq from '../util/uniq.ts'

export async function initializeHealthWorker(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  profile: GoogleProfile,
  invitees: { id: number; facility_id: number; profession: Profession }[],
): Promise<EmployedHealthWorker> {
  const calendars = await googleClient
    .ensureHasAppointmentsAndAvailabilityCalendars()

  const healthWorker = await health_workers.upsertWithGoogleCredentials(trx, {
    name: profile.name,
    email: profile.email,
    avatar_url: profile.picture,
    gcal_appointments_calendar_id: calendars.vhaAppointmentsCalendar.id,
    gcal_availability_calendar_id: calendars.vhaAvailabilityCalendar.id,
    ...health_workers.pickTokens(googleClient.tokens),
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

  const facility_ids = uniq(invitees.map((invitee) => invitee.facility_id))

  const employedAtFacilities = await facilities.get(trx, { ids: facility_ids })

  return {
    ...healthWorker,
    employment: facility_ids.map((facility_id) => ({
      facility_id,
      facility_name:
        employedAtFacilities.find((f) => f.id === facility_id)!.name,
      facility_display_name:
        employedAtFacilities.find((f) => f.id === facility_id)!.display_name,
      roles: {
        nurse: invitees.some((invitee) =>
            invitee.facility_id === facility_id &&
            invitee.profession === 'nurse'
          )
          ? {
            employed_as: true,
            registration_needed: true,
            registration_completed: false,
            registration_pending_approval: true,
          }
          : {
            employed_as: false,
            registration_needed: false,
            registration_completed: false,
            registration_pending_approval: false,
          },
        doctor:
          invitees.some((invitee) =>
              invitee.facility_id === facility_id &&
              invitee.profession === 'doctor'
            )
            ? {
              employed_as: true,
              registration_needed: false,
              registration_completed: true,
              registration_pending_approval: false,
            }
            : {
              employed_as: false,
              registration_needed: false,
              registration_completed: false,
              registration_pending_approval: false,
            },
        admin: invitees.some((invitee) =>
            invitee.facility_id === facility_id &&
            invitee.profession === 'admin'
          )
          ? {
            employed_as: true,
            registration_needed: false,
            registration_completed: true,
            registration_pending_approval: false,
          }
          : {
            employed_as: false,
            registration_needed: false,
            registration_completed: false,
            registration_pending_approval: false,
          },
      },
    })),
  }
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
          : health_workers.updateTokens(
            trx,
            profile.email,
            health_workers.pickTokens(tokens),
          )
      )

      if (!healthWorker) return false

      session.set('health_worker_id', healthWorker.id)

      return true
    })

    return authorized
      ? redirect('/app')
      : new Response('Not authorized', { status: 401 })
  },
}
