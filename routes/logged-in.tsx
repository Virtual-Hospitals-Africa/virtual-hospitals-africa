import { setCookie } from 'std/http/cookie.ts'
import { assert } from 'std/assert/assert.ts'
import { getInitialTokensFromAuthCode } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import db from '../db/db.ts'
import { sessions } from '../db/models/sessions.ts'
import { health_workers } from '../db/models/health_workers.ts'
import { health_worker_accounts } from '../db/models/health_worker_accounts.ts'
import { google_tokens } from '../db/models/google_tokens.ts'
import { events } from '../db/models/events.ts'
import * as google from '../external-clients/google.ts'
import { media } from '../db/models/media.ts'
import { GoogleProfile, HasStringId, Regulator, TrxOrDb } from '../types.ts'
import { assertOrRedirect } from '../util/assertOr.ts'
import { warning } from '../util/alerts.ts'
import * as cookie from '../shared/cookie.ts'
import { promiseProps } from '../util/promiseProps.ts'
import { asNames } from '../util/asNames.ts'
import { Context } from 'fresh'

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

export async function initializeHealthWorkerWithoutInvites(
  trx: TrxOrDb,
  google_client: google.GoogleClient,
  profile: GoogleProfile,
): Promise<Response> {
  const {
    avatar_media_id,
    existing_health_worker,
  } = await promiseProps({
    avatar_media_id: downloadAndSaveAvatar(trx, profile.picture),
    existing_health_worker: health_workers.getIdByEmail(
      trx,
      profile.email,
    ),
  })

  const health_worker_attributes = asNames({
    first_names: profile.first_names,
    surname: profile.surname,
    name: profile.name,
  })

  const health_worker_account_attributes = {
    email: profile.email,
    avatar_media_id,
  }

  async function insertNewHealthWorker() {
    const health_worker_id = await health_workers.insertOne(
      trx,
      health_worker_attributes,
    )
    await Promise.all([
      health_worker_accounts.insertOne(trx, {
        id: health_worker_id,
        ...health_worker_account_attributes,
      }),
      google_tokens.insertOne(
        trx,
        {
          entity_type: 'health_worker',
          entity_id: health_worker_id,
          // Don't ...spread - expires_in is not a column of google_tokens
          expires_at: google_client.tokens.expires_at,
          access_token: google_client.tokens.access_token,
          refresh_token: google_client.tokens.refresh_token,
        },
      ),
    ])

    return { health_worker_id, existing_employment: null }
  }

  function updateExistingHealthWorker(health_worker_id: string) {
    return promiseProps({
      health_worker_id: Promise.resolve(health_worker_id),
      existing_employment: trx.selectFrom('employment')
        .where('employment.health_worker_id', '=', health_worker_id)
        .select('employment.id')
        .executeTakeFirst(),
      update_tokens: google_tokens.upsert(
        trx,
        'health_worker',
        health_worker_id,
        google_client.tokens,
      ),
      health_worker: health_workers.updateById(
        trx,
        health_worker_id,
        health_worker_attributes,
      ),
    })
  }

  const { health_worker_id, existing_employment } = await (
    existing_health_worker ? updateExistingHealthWorker(existing_health_worker.id) : insertNewHealthWorker()
  )

  await events.insert(trx, {
    type: 'HealthWorkerLogin',
    data: { health_worker_id },
  })

  const session_id = await sessions.insertOne(trx, {
    entity_type: 'health_worker',
    entity_id: health_worker_id,
  })

  const response = redirect(
    existing_employment ? '/app' : '/onboarding/welcome',
  )

  setCookie(response.headers, {
    name: cookie.session_key,
    value: session_id,
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
  const session_id = await sessions.insertOne(trx, {
    entity_type: 'regulator',
    entity_id: regulator.id,
  })

  const response = redirect(
    `/regulator/${regulator.country}/pharmacies`,
  )

  setCookie(response.headers, {
    name: cookie.session_key,
    value: session_id,
  })

  return response
}

export const handler = {
  async GET(ctx: Context<unknown>) {
    const code = ctx.url.searchParams.get('code')
    assert(code, 'No code found in query params')
    const tokens = await getInitialTokensFromAuthCode(code)
    const google_client = new google.GoogleClient(tokens)
    const has_permissions = await checkPermissions(google_client)
    assertOrRedirect(has_permissions, insufficient_permissions)
    const profile = await google_client.getProfile()

    return db.transaction().setIsolationLevel('read committed').execute(
      (trx) =>
        initializeHealthWorkerWithoutInvites(
          trx,
          google_client,
          profile,
        ),
    )
  },
}
