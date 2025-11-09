import { parseRequestAsserts } from '../util/parseForm.ts'
import * as slack from '../external-clients/slack.ts'
import db from '../db/db.ts'
import redirect from '../util/redirect.ts'
import { assertOr400 } from '../util/assertOr.ts'
import isObjectLike from '../util/isObjectLike.ts'
import {
  CONTACT_REASON_OPTIONS,
  ContactReason,
} from '../components/library/ContactForm.tsx'
import { Handlers } from 'fresh/compat'

function assertIsMailingListRecipient(
  form_values: unknown,
): asserts form_values is {
  name: string
  email: string
  reason: ContactReason
  interest?: string
  message?: string
  support?: string
} {
  assertOr400(isObjectLike(form_values))
  assertOr400('name' in form_values && typeof form_values['name'] == 'string')
  assertOr400(
    'reason' in form_values &&
      typeof form_values['reason'] == 'string' &&
      CONTACT_REASON_OPTIONS.some(
        (option) => option.value === form_values['reason'],
      ),
  )
  assertOr400('email' in form_values && typeof form_values['email'] == 'string')
  assertOr400(form_values['email'].includes('@'))
}

const success_messages = {
  general_inquiry: (name: string) =>
    `Thanks for your interest ${name}! Our team has received your inquiry and will respond as soon as possible 🚀`,
  book_a_demo: (name: string) =>
    `Thanks for your interest in a demo ${name}! We\'ll reach out shortly to schedule a time to connect ⏰`,
  book_an_intro_call: (name: string) =>
    `Thanks for your interest in an intro call ${name}! We\'ll reach out shortly to schedule a time to connect ⏰`,
  request_investor_deck: (name: string) =>
    `Thanks for your interest in a our investor deck ${name}! We\'ll reach out shortly to send it to you 🚀`,
}

export const handler: Handlers = {
  async POST(ctx) {
    const req = ctx.req
    const recipient = await parseRequestAsserts(
      db,
      req,
      assertIsMailingListRecipient,
    )

    // await mailing_list.add(db, recipient)

    let slackMessage =
      `New interest from ${recipient.name} ${recipient.email}\n\nreason: ${recipient.reason}`
    if (recipient.interest) {
      slackMessage += `\ninterest: ${recipient.interest}`
    }
    if (recipient.support) slackMessage += `\nsupport: ${recipient.support}`
    if (recipient.message) slackMessage += `\n\n"${recipient.message}"`

    await slack.send(slackMessage)

    const success = success_messages[recipient.reason](recipient.name)

    return redirect(`/thank-you?success=${encodeURIComponent(success)}`)
  },
}
