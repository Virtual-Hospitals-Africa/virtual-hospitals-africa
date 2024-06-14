import { assert } from 'std/assert/assert.ts'

const APPLICATION_EVENTS_SLACK_WEBHOOK_URL = Deno.env.get(
  'APPLICATION_EVENTS_SLACK_WEBHOOK_URL',
)

const ENGINEERING_SLACK_WEBHOOK_URL = Deno.env.get('ENGINEERING_SLACK_WEBHOOK_URL') 
|| 'https://hooks.slack.com/services/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';


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

export function sendToEngineeringChannel(text: string) {
  assert(ENGINEERING_SLACK_WEBHOOK_URL)
  return fetch(ENGINEERING_SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })
}
