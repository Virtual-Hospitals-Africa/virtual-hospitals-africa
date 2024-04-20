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
import { GoogleProfile, GoogleTokens, Profession, TrxOrDb } from '../types.ts'
import uniq from '../util/uniq.ts'
import zip from '../util/zip.ts'
import { addCalendars } from '../db/models/providers.ts'

export async function initializeHealthWorker(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  profile: GoogleProfile,
  invitees: { id: number; organization_id: number; profession: Profession }[],
): Promise<{ id: number }> {
  assert(invitees.length, 'No invitees found')

  // Fire off async operations in parallel
  const removing_invites = employment.removeInvitees(
    trx,
    invitees.map((invitee) => invitee.id),
  )

  const organization_ids = uniq(invitees.map((invitee) => invitee.organization_id))
  const getting_calendars = facilities.get(trx, { ids: organization_ids })
    .then(
      async (facilities) => {
        const calendars = await googleClient
          .ensureHasAppointmentsAndAvailabilityCalendars(facilities)
        return Array.from(zip(facilities, calendars)).map((
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

type AuthCheckResult =
  | { status: 'authorized'; healthWorker: { id: number } }
  | { status: 'unauthorized' }
  | { status: 'insufficient_permissions' }

function authCheck(
  gettingTokens: Promise<GoogleTokens>,
): Promise<AuthCheckResult> {
  return db.transaction().execute(async (trx) => {
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

    if (!healthWorker) return { status: 'unauthorized' }

    const hasPermissions = await checkPermissions(googleClient)
    if (!hasPermissions) return { status: 'insufficient_permissions' }

    return { status: 'authorized', healthWorker }
  })
}

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(_req, ctx) {
    const { session } = ctx.state
    const code = ctx.url.searchParams.get('code')

    assert(code, 'No code found in query params')

    const gettingTokens = getInitialTokensFromAuthCode(code)
    const result = await authCheck(gettingTokens)

    if (result.status === 'authorized') {
      session.set('health_worker_id', result.healthWorker.id)
      return redirect('/app')
    }
    return redirect(`/app/${result.status}`)
  },
}
