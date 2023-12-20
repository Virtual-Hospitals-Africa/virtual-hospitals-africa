import { Handlers, PageProps } from '$fresh/server.ts'
import * as slack from '../../external-clients/slack.ts'
import { assert } from 'std/assert/assert.ts'
import { createHmac } from 'https://deno.land/std@0.166.0/node/crypto.ts'

async function validSignature(request: Request, secret: string) {
  const heroku_hmac = request.headers.get('heroku-webhook-hmac-sha256')
  assert(heroku_hmac, 'No Heroku HMAC signature')
  const body = await request.json()
  assert(body)
  const hmac = createHmac('sha256', secret)
  hmac.update(body)
  const digest = hmac.digest('base64')
  return heroku_hmac === digest
}

export const handler: Handlers = {
  async POST(req, _) {
    const secret = Deno.env.get('HEROKU_WEBHOOK_SECRET')
    assert(secret)
    const valid = await validSignature(req, secret)
    assert(valid, 'Invalid signature, not from Heroku')
    const incomingHerokuMessage = await req.json()
    const { data } = incomingHerokuMessage
    const { name, state } = data

    const message = `The app ${name} is now scaling ${state}`
    assert(message)

    const response = await slack.send(message)
    assert(response.ok)
    return new Response('ok')
  },
}
