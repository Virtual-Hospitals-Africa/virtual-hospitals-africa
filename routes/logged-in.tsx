import { setCookie } from 'std/http/cookie.ts'
import { Handlers } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import { getInitialTokensFromAuthCode } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import db from '../db/db.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as sessions from '../db/models/sessions.ts'
import * as employment from '../db/models/employment.ts'
import * as organizations from '../db/models/organizations.ts'
import * as regulators from '../db/models/regulators.ts'
import * as events from '../db/models/events.ts'
import * as google from '../external-clients/google.ts'
import {
  GoogleProfile,
  HasStringId,
  Profession,
  Regulator,
  TrxOrDb,
} from '../types.ts'
import uniq from '../util/uniq.ts'
import zip from '../util/zip.ts'
import { addCalendars } from '../db/models/providers.ts'
import { assertOrRedirect } from '../util/assertOr.ts'
import { warning } from '../util/alerts.ts'
import { could_not_locate_account_href } from './app/_middleware.tsx'
import * as cookie from '../shared/cookie.ts'
import { promiseProps } from '../util/promiseProps.ts'

const USE_INVITE_SYSTEM = Deno.env.has('USE_INVITE_SYSTEM')

export async function ensureHasAppointmentsAndAvailabilityCalendarsForAllOrgs(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  organization_ids: string[],
) {
  const my_orgs = await organizations.getByIds(trx, organization_ids)
  const calendars = await googleClient
    .ensureHasAppointmentsAndAvailabilityCalendars(my_orgs)
  return Array.from(zip(my_orgs, calendars)).map((
    [organization, calendars],
  ) => ({
    organization_id: organization.id,
    ...calendars,
  }))
}
export async function initializeHealthWorkerWithInvites(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  profile: GoogleProfile,
  invitees: { id: string; organization_id: string; profession: Profession }[],
): Promise<{ id: string }> {
  assert(invitees.length, 'No invitees found')

  await employment.removeInvitees(
    trx,
    invitees.map((invitee) => invitee.id),
  )

  const organization_ids = uniq(
    invitees.map((invitee) => invitee.organization_id),
  )

  const calendars =
    await ensureHasAppointmentsAndAvailabilityCalendarsForAllOrgs(
      trx,
      googleClient,
      organization_ids,
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

  const health_worker_id = health_worker.id

  await addCalendars(trx, health_worker_id, calendars)

  await Promise.all(
    invitees.map(({ organization_id, profession }) =>
      employment.addIgnoreDuplicate(
        trx,
        { health_worker_id, organization_id, profession },
      )
    ),
  )

  await events.insert(trx, {
    type: 'HealthWorkerLogin',
    data: { health_worker_id },
  })

  return { id: health_worker_id }
}

export async function initializeHealthWorkerWithoutInvites(
  trx: TrxOrDb,
  googleClient: google.GoogleClient,
  profile: GoogleProfile,
): Promise<Response> {
  const { existing_employment, health_worker } = await promiseProps({
    existing_employment: trx.selectFrom('health_workers')
      .innerJoin(
        'employment',
        'employment.health_worker_id',
        'health_workers.id',
      )
      .where('health_workers.email', '=', profile.email)
      .select('employment.id')
      .executeTakeFirst(),
    health_worker: health_workers.upsertWithGoogleCredentials(
      trx,
      {
        name: profile.name,
        email: profile.email,
        avatar_url: profile.picture,
        ...health_workers.pickTokens(googleClient.tokens),
      },
    ),
  })

  const health_worker_id = health_worker.id

  await events.insert(trx, {
    type: 'HealthWorkerLogin',
    data: { health_worker_id },
  })

  const session = await sessions.create(trx, 'health_worker', {
    entity_id: health_worker.id,
  })

  const response = redirect(
    existing_employment ? '/app' : '/onboarding/welcome',
  )

  console.log('mmmwemmmmmm', session)

  setCookie(response.headers, {
    name: cookie.session_key,
    value: session.id,
  })

  return response
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

export async function startRegulatorSession(
  trx: TrxOrDb,
  regulator: HasStringId<Regulator>,
) {
  const session = await sessions.create(trx, 'regulator', {
    entity_id: regulator.id,
  })

  const response = redirect(
    `/regulator/${regulator.country}/pharmacies`,
  )

  setCookie(response.headers, {
    name: cookie.session_key,
    value: session.id,
  })

  return response
}

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

          return startRegulatorSession(trx, regulator)
        }

        if (!USE_INVITE_SYSTEM) {
          return initializeHealthWorkerWithoutInvites(
            trx,
            googleClient,
            profile,
          )
        }

        const health_worker_invitees = await employment.getInvitees(trx, {
          email: profile.email,
        })

        const health_worker = await (
          health_worker_invitees.length
            ? initializeHealthWorkerWithInvites(
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

        const session = await sessions.create(trx, 'health_worker', {
          entity_id: health_worker.id,
        })

        const response = redirect('/app')

        console.log('awkjejkawejkeaw')

        setCookie(response.headers, {
          name: cookie.session_key,
          value: session.id,
        })

        return response
      },
    )
  },
}
