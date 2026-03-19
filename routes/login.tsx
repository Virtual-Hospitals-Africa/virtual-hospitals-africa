import redirect from '../util/redirect.ts'
import * as cookie from '../shared/session_cookie.ts'
import { sessions } from '../db/models/sessions.ts'
import db from '../db/db.ts'
import { deleteCookie, setCookie } from 'std/http/cookie.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import generateUUID from '../util/uuid.ts'
import { TrxOrDb } from '../types.ts'
import randomNamesAndSex from '../mocks/randomNamesAndSex.ts'
import { Context } from 'fresh'
import memoize from '../util/memoize.ts'
import { readBooleanEnvironmentVariable, readMandatoryStringEnvironmentVariable } from '../util/env.ts'
import { redirectUri } from '../external-clients/google.ts'
import { health_worker_google_tokens } from '../db/models/health_worker_google_tokens.ts'
import randomAvatarMediaId from '../mocks/randomAvatar.ts'

const FAKE_GOOGLE_AUTH = readBooleanEnvironmentVariable('FAKE_GOOGLE_AUTH')
// if (FAKE_GOOGLE_AUTH) {
//   assert(!onProduction(), 'Cannot fake google authentication on production')
// }

export const loginHref = memoize(() => {
  const client_id = readMandatoryStringEnvironmentVariable('GOOGLE_CLIENT_ID')

  const oauth_params = new URLSearchParams({
    redirect_uri: redirectUri(),
    prompt: 'consent',
    response_type: 'code',
    client_id,
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    access_type: 'offline',
    service: 'lso',
    o2v: '2',
    flowName: 'GeneralOAuthFlow',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauth_params}`
})

async function fakeGoogleLogin(trx: TrxOrDb) {
  const { sex, ...names } = randomNamesAndSex('ZA')
  const email = generateUUID() + '@example.com'
  const avatar_media_id = randomAvatarMediaId(sex)
  const access_token = generateUUID()
  const refresh_token = generateUUID()
  const expires_at = new Date()
  expires_at.setDate(expires_at.getDate() + 60)

  const health_worker = await health_worker_google_tokens
    .insertWithGoogleCredentials(trx, {
      ...names,
      email,
      avatar_media_id,
      access_token,
      refresh_token,
      expires_at,
    })

  const session_id = await sessions.insertOne(trx, {
    entity_type: 'health_worker',
    entity_id: health_worker.id,
  })

  const response = redirect('/onboarding/welcome')

  setCookie(response.headers, {
    name: cookie.session_key,
    value: session_id,
  })
  setCookie(response.headers, {
    name: 'health_worker_id',
    value: health_worker.id,
  })

  return response
}

export const handler = {
  // deno-lint-ignore no-explicit-any
  async GET(ctx: Context<any>) {
    const req = ctx.req
    const session_id = cookie.getSessionCookie(req)
    if (!session_id) {
      return FAKE_GOOGLE_AUTH ? fakeGoogleLogin(db) : redirect(loginHref())
    }

    const session = await sessions.getByIdOptional(db, session_id, { entity_type: 'health_worker' })

    if (!session) {
      const response = await (FAKE_GOOGLE_AUTH ? fakeGoogleLogin(db) : redirect(loginHref()))
      deleteCookie(response.headers, cookie.session_key)
      deleteCookie(response.headers, 'health_worker_id')
      return response
    }

    if (session.entity_type === 'health_worker') {
      return redirect(`/app?from_login=true`)
    }

    assertEquals(session.entity_type, 'regulator')

    return redirect('/regulator?from_login=true')
  },
}
