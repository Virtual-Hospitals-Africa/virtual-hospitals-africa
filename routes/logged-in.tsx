import { Handlers } from '$fresh/server.ts'
import { Session, WithSession } from 'fresh_session'
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
import { handleError } from './_middleware.ts'

export async function initializeHealthWorker(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  profile: GoogleProfile,
  invitees: { id: string; organization_id: string; profession: Profession }[],
): Promise<{ id: string }> {
  assert(invitees.length, 'No invitees found')

  // Fire off async operations in parallel
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

type AuthCheckResult =
  | {
    status: 'authorized'
    type: 'practitioner'
    practitioner: { id: string }
  }
  | { status: 'authorized'; type: 'regulator'; regulator: { id: string } }
  | { status: 'unauthorized' }
  | { status: 'insufficient_permissions' }

function authCheck(
  gettingTokens: Promise<GoogleTokens>,
): Promise<AuthCheckResult> {
  return db.transaction().execute(async (trx) => {
    const tokens = await gettingTokens
    const googleClient = new google.GoogleClient(tokens)
    const profile = await googleClient.getProfile()

    const is_invited_as_regulator = await regulators.isInvited(profile.email)

    if (is_invited_as_regulator) {
      const hasPermissions = await checkPermissions(googleClient)
      if (!hasPermissions) return { status: 'insufficient_permissions' }
      return {
        status: 'authorized',
        type: 'regulator',
        regulator: { id: '1' },
        email: profile.email,
      }
    }

    const health_worker_invitees = await employment.getInvitees(trx, {
      email: profile.email,
    })

    const healthWorker = await (
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

    if (!healthWorker) return { status: 'unauthorized' }

    const hasPermissions = await checkPermissions(googleClient)
    if (!hasPermissions) return { status: 'insufficient_permissions' }

    return {
      status: 'authorized',
      type: 'practitioner',
      practitioner: healthWorker,
      email: profile.email,
    }
  })
}

function handleAuthorized(
  result: AuthCheckResult & { status: 'authorized' },
  session: Session,
) {
  switch (result.type) {
    case 'practitioner':
      session.set('health_worker_id', result.practitioner.id)
      return redirect('/app')
    case 'regulator':
      session.set('regulator_id', result.regulator.id)
      return redirect('/regulator')
  }
}

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(_req, ctx) {
    const { session } = ctx.state
    const code = ctx.url.searchParams.get('code')

    assert(code, 'No code found in query params')

    const gettingTokens = getInitialTokensFromAuthCode(code)
    const result = await authCheck(gettingTokens).catch(handleError)

    if (result.status === 'authorized') {
      return handleAuthorized(result, session)
    }
    return redirect(`/app/${result.status}`)
  },
}
