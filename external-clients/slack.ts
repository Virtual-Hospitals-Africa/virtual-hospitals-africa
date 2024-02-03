import { assert } from 'std/assert/assert.ts'

const APPLICATION_EVENTS_SLACK_WEBHOOK_URL = Deno.env.get(
  'APPLICATION_EVENTS_SLACK_WEBHOOK_URL',
)

export function send(text: string) {
  assert(APPLICATION_EVENTS_SLACK_WEBHOOK_URL)
  return fetch(APPLICATION_EVENTS_SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })
}
