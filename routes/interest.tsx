import { Handlers } from '$fresh/server.ts'
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

function assertIsMailingListRecipient(
  formValues: unknown,
): asserts formValues is {
  name: string
  email: string
  reason: ContactReason
  interest?: string
  message?: string
  support?: string
} {
  assertOr400(isObjectLike(formValues))
  assertOr400('name' in formValues && typeof formValues['name'] == 'string')
  assertOr400(
    'reason' in formValues &&
      typeof formValues['reason'] == 'string' &&
      CONTACT_REASON_OPTIONS.some(
        (option) => option.value === formValues['reason'],
      ),
  )
  assertOr400('email' in formValues && typeof formValues['email'] == 'string')
  assertOr400(formValues['email'].includes('@'))
}

const successMessages = {
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
  async POST(req) {
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

    const success = successMessages[recipient.reason](recipient.name)

    return redirect(`/thank-you?success=${encodeURIComponent(success)}`)
  },
}
