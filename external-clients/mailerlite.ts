import { assert } from 'std/assert/assert.ts'
import { MailingListRecipient } from '../types.ts'

const MAILERLITE_API_TOKEN = Deno.env.get('MAILERLITE_API_TOKEN')

export async function addSubscriber(recipient: MailingListRecipient) {
  assert(MAILERLITE_API_TOKEN, `MAILERLITE_API_TOKEN must be set`)

  const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MAILERLITE_API_TOKEN}`,
    },
    body: JSON.stringify({
      email: recipient.email,
      fields: {
        name: recipient.name,
        entrypoint: recipient.entrypoint,
        ...(recipient.interest && { interest: recipient.interest }),
        ...(recipient.message && { message: recipient.message }),
        ...(recipient.support && { support: recipient.support }),
        ...(recipient.company_name && { company: recipient.company_name }),
        ...(recipient.job_title && { job_title: recipient.job_title }),
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`MailerLite addSubscriber failed: ${response.status} ${body}`)
  }
}
