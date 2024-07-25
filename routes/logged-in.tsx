import { Handlers } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import { getInitialTokensFromAuthCode } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as employment from '../db/models/employment.ts'
import * as organizations from '../db/models/organizations.ts'
import * as regulators from '../db/models/regulators.ts'
import * as google from '../external-clients/google.ts'
import { GoogleProfile, GoogleTokens, Profession, TrxOrDb } from '../types.ts'
import uniq from '../util/uniq.ts'
import zip from '../util/zip.ts'
import { addCalendars } from '../db/models/providers.ts'
import { assertOrRedirect } from '../util/assertOr.ts'
import { warning } from '../util/alerts.ts'
import { could_not_locate_account_href } from './app/_middleware.ts'
import { setCookie } from 'std/http/cookie.ts'

export async function initializeHealthWorker(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  profile: GoogleProfile,
  invitees: { id: string; organization_id: string; profession: Profession }[],
): Promise<{ id: string }> {
  assert(invitees.length, 'No invitees found')

  const removing_invites = await employment.removeInvitees(
    trx,
    invitees.map((invitee) => invitee.id),
  )

  const organization_ids = uniq(
    invitees.map((invitee) => invitee.organization_id),
  )
  const getting_calendars = organizations.get(trx, { ids: organization_ids })
    .then(
      async (organizations) => {
        const calendars = await googleClient
          .ensureHasAppointmentsAndAvailabilityCalendars(organizations)
        return Array.from(zip(organizations, calendars)).map((
          [organization, calendars],
        ) => ({
          organization_id: organization.id,
          ...calendars,
        }))
      },
    )

  const health_worker = await health_workers.upsertWithGoogleCredentials(
    trx,
    {
      name: profile.name,
      email: profile.email,
      avatar_url: profile.picture,
      ...health_workers.pickTokens(googleClient.tokens),
    },
  )

  const adding_roles = employment.add(
    trx,
    invitees.map((invitee) => ({
      health_worker_id: health_worker.id,
      organization_id: invitee.organization_id,
      profession: invitee.profession,
    })),
  )

  await addCalendars(trx, health_worker.id, await getting_calendars)
  await removing_invites
  await adding_roles

  return { id: health_worker.id }
}

async function checkPermissions(
  googleClient: google.GoogleClient,
): Promise<boolean> {
  const tokenInfo = await googleClient.getTokenInfo()
  return tokenInfo.scope.includes('calendar')
}

const insufficient_permissions = warning(
  'You need to grant permission to access your Google Calendar to use this app.',
)

export const handler: Handlers<Record<string, never>> = {
  GET(_req, ctx) {
    const code = ctx.url.searchParams.get('code')
    assert(code, 'No code found in query params')
    const gettingTokens = getInitialTokensFromAuthCode(code)

    return db.transaction().setIsolationLevel('read committed').execute(
      async (trx) => {
        const tokens = await gettingTokens
        const googleClient = new google.GoogleClient(tokens)
        const hasPermissions = await checkPermissions(googleClient)

        assertOrRedirect(hasPermissions, insufficient_permissions)

        const profile = await googleClient.getProfile()

        const regulator = await regulators.getByEmail(trx, profile.email)
        if (regulator) {
          if (
            regulator.name !== profile.name ||
            regulator.avatar_url !== profile.picture
          ) {
            await regulators.update(trx, {
              id: regulator.id,
              name: profile.name,
              avatar_url: profile.picture,
            })
          }

          const session = await regulators.createSession(trx, {
            regulator_id: regulator.id,
          })

          const response = redirect('/regulator/pharmacies')

          setCookie(response.headers, {
            name: 'regulator_session_id',
            value: session.id,
          })

          return response
        }

        const health_worker_invitees = await employment.getInvitees(trx, {
          email: profile.email,
        })

        const health_worker = await (
          health_worker_invitees.length
            ? initializeHealthWorker(
              trx,
              googleClient,
              profile,
              health_worker_invitees,
            )
            : health_workers.updateTokens(
              trx,
              profile.email,
              health_workers.pickTokens(tokens),
            )
        )

        assertOrRedirect(health_worker, could_not_locate_account_href)

        const session = await health_workers.createSession(trx, {
          health_worker_id: health_worker.id,
        })

        const response = redirect('/app')

        setCookie(response.headers, {
          name: 'health_worker_session_id',
          value: session.id,
        })

        return response
      },
    )
  },
}
