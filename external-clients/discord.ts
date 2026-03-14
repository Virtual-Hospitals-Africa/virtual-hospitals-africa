import { assert } from 'std/assert/assert.ts'
import { MailingListRecipient } from '../types.ts'

const DISCORD_MAILING_LIST_WEBHOOK_URL = Deno.env.get(
  'DISCORD_MAILING_LIST_WEBHOOK_URL',
)

export async function notifyMailingListSignup(recipient: MailingListRecipient) {
  assert(DISCORD_MAILING_LIST_WEBHOOK_URL, `DISCORD_MAILING_LIST_WEBHOOK_URL must be set`)

  let content = `🎉 **New Subscriber!**\n\n${recipient.name} ${recipient.email}`
  if (recipient.entrypoint) content += `\nentrypoint: ${recipient.entrypoint}`
  if (recipient.interest) content += `\ninterest: ${recipient.interest}`
  if (recipient.support) content += `\nsupport: ${recipient.support}`
  if (recipient.message) content += `\n\n"${recipient.message}"`

  await fetch(DISCORD_MAILING_LIST_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}
