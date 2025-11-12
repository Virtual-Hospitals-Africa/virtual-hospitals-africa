import { setCookie } from 'std/http/cookie.ts'
import { assert } from 'std/assert/assert.ts'
import { getInitialTokensFromAuthCode } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import db from '../db/db.ts'
import * as sessions from '../db/models/sessions.ts'
import * as employment from '../db/models/employment.ts'
import * as organizations from '../db/models/organizations.ts'
import * as regulators from '../db/models/regulators.ts'
import * as events from '../db/models/events.ts'
import * as google from '../external-clients/google.ts'
import * as media from '../db/models/media.ts'
import {
  GoogleProfile,
  HasStringId,
  Profession,
  Regulator,
  TrxOrDb,
} from '../types.ts'
import uniq from '../util/uniq.ts'
import zip from '../util/zip.ts'
import { assertOrRedirect } from '../util/assertOr.ts'
import { warning } from '../util/alerts.ts'
import { could_not_locate_account_href } from './app/_middleware.tsx'
import * as cookie from '../shared/cookie.ts'
import { promiseProps } from '../util/promiseProps.ts'
import * as health_worker_organization_calenders from '../db/models/health_worker_organization_calenders.ts'
import { asNames } from '../db/models/asNames.ts'
import { Handlers } from 'fresh/compat'
import {
  pickTokens,
  updateTokens,
  upsertWithGoogleCredentials,
} from '../db/models/health_worker_google_tokens.ts'

async function downloadAndSaveAvatar(
  trx: TrxOrDb,
  picture_url: string,
): Promise<string | null> {
  try {
    const response = await fetch(picture_url)
    if (!response.ok) return null

    const content_type = response.headers.get('content-type')
    if (!content_type?.startsWith('image/')) return null

    const array_buffer = await response.arrayBuffer()
    const binary_data = new Uint8Array(array_buffer)

    const inserted_media = await media.insert(trx, {
      binary_data,
      mime_type: content_type,
    })

    return inserted_media.id
  } catch {
    return null
  }
}

const USE_INVITE_SYSTEM = Deno.env.has('USE_INVITE_SYSTEM')

export async function ensureHasAppointmentsAndAvailabilityCalendarsForAllOrgs(
  trx: TrxOrDb,
  google_client: google.GoogleClient,
  organization_ids: string[],
) {
  const my_orgs = await organizations.getByIds(trx, organization_ids)
  const calendars = await google_client
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
  google_client: google.GoogleClient,
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
      google_client,
      organization_ids,
    )

  const avatar_media_id = await downloadAndSaveAvatar(trx, profile.picture)

  const health_worker = await upsertWithGoogleCredentials(
    trx,
    {
      email: profile.email,
      avatar_media_id,
      ...pickTokens(google_client.tokens),
      ...asNames({
        first_names: profile.given_name,
        surname: profile.family_name,
        name: profile.name,
      }),
    },
  )

  const health_worker_id = health_worker.id

  await health_worker_organization_calenders.add(
    trx,
    health_worker_id,
    calendars,
  )

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
  google_client: google.GoogleClient,
  profile: GoogleProfile,
): Promise<Response> {
  const avatar_media_id = await downloadAndSaveAvatar(trx, profile.picture)

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
    health_worker: upsertWithGoogleCredentials(
      trx,
      {
        email: profile.email,
        avatar_media_id,
        ...pickTokens(google_client.tokens),
        ...asNames({
          first_names: profile.given_name,
          surname: profile.family_name,
          name: profile.name,
        }),
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

  setCookie(response.headers, {
    name: cookie.session_key,
    value: session.id,
  })

  return response
}

async function checkPermissions(
  google_client: google.GoogleClient,
): Promise<boolean> {
  const token_info = await google_client.getTokenInfo()
  return token_info.scope.includes('calendar')
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
  GET(ctx) {
    const code = ctx.url.searchParams.get('code')
    assert(code, 'No code found in query params')
    const getting_tokens = getInitialTokensFromAuthCode(code)

    return db.transaction().setIsolationLevel('read committed').execute(
      async (trx) => {
        const tokens = await getting_tokens
        const google_client = new google.GoogleClient(tokens)
        const has_permissions = await checkPermissions(google_client)

        assertOrRedirect(has_permissions, insufficient_permissions)

        const profile = await google_client.getProfile()

        const regulator = await regulators.getByEmail(trx, profile.email)
        if (regulator) {
          const avatar_media_id = await downloadAndSaveAvatar(
            trx,
            profile.picture,
          )

          if (regulator.name !== profile.name) {
            await regulators.update(trx, {
              id: regulator.id,
              name: profile.name,
              avatar_media_id,
            })
          }

          return startRegulatorSession(trx, regulator)
        }

        if (!USE_INVITE_SYSTEM) {
          return initializeHealthWorkerWithoutInvites(
            trx,
            google_client,
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
              google_client,
              profile,
              health_worker_invitees,
            )
            : updateTokens(
              trx,
              profile.email,
              pickTokens(tokens),
            )
        )

        assertOrRedirect(health_worker, could_not_locate_account_href)

        const session = await sessions.create(trx, 'health_worker', {
          entity_id: health_worker.id,
        })

        const response = redirect('/app')

        setCookie(response.headers, {
          name: cookie.session_key,
          value: session.id,
        })

        return response
      },
    )
  },
}
