import redirect from '../util/redirect.ts'
import * as cookie from '../shared/cookie.ts'
import * as sessions from '../db/models/sessions.ts'
import * as health_workers from '../db/models/health_workers.ts'
import db from '../db/db.ts'
import { deleteCookie, setCookie } from 'std/http/cookie.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import { onProduction } from '../util/onProduction.ts'
import generateUUID from '../util/uuid.ts'
import { TrxOrDb } from '../types.ts'
import randomAvatar from '../mocks/randomAvatar.ts'
import randomNamesAndSex from '../mocks/randomDemographics.ts'
import { Context } from 'fresh'
import memoize from '../util/memoize.ts'
import {
  readBooleanEnvironmentVariable,
  readMandatoryStringEnvironmentVariable,
} from '../util/env.ts'
import { redirectUri } from '../external-clients/google.ts'

const FAKE_GOOGLE_AUTH = readBooleanEnvironmentVariable('FAKE_GOOGLE_AUTH')
if (FAKE_GOOGLE_AUTH) {
  assert(!onProduction(), 'Cannot fake google authentication on production')
}

export const loginHref = memoize(() => {
  const client_id = readMandatoryStringEnvironmentVariable('GOOGLE_CLIENT_ID')

  const oauth_params = new URLSearchParams({
    redirect_uri: redirectUri(),
    prompt: 'consent',
    response_type: 'code',
    client_id,
    scope:
      'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    access_type: 'offline',
    service: 'lso',
    o2v: '2',
    flowName: 'GeneralOAuthFlow',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauth_params}`
})

async function fakeGoogleLogin(trx: TrxOrDb) {
  const { sex, ...names } = randomNamesAndSex()
  const email = generateUUID() + '@example.com'
  const avatar_url = randomAvatar(sex)
  const access_token = generateUUID()
  const refresh_token = generateUUID()
  const expires_at = new Date()
  expires_at.setDate(expires_at.getDate() + 60)
  const health_worker = await health_workers.upsertWithGoogleCredentials(trx, {
    ...names,
    email,
    avatar_url,
    access_token,
    refresh_token,
    expires_at,
  })

  const session = await sessions.create(trx, 'health_worker', {
    entity_id: health_worker.id,
  })

  const response = redirect('/onboarding/welcome')

  setCookie(response.headers, {
    name: cookie.session_key,
    value: session.id,
  })

  return response
}

export const handler = {
  // deno-lint-ignore no-explicit-any
  async GET(ctx: Context<any>) {
    const req = ctx.req
    const session_id = cookie.get(req)
    if (!session_id) {
      return FAKE_GOOGLE_AUTH ? fakeGoogleLogin(db) : redirect(loginHref())
    }

    const session = await sessions.getBySessionId(db, session_id)

    if (!session) {
      const response = redirect(loginHref())
      deleteCookie(response.headers, cookie.session_key)
      return response
    }

    if (session.entity_type === 'health_worker') {
      return redirect(`/app?from_login=true`)
    }

    assertEquals(session.entity_type, 'regulator')

    return redirect('/regulator?from_login=true')
  },
}
