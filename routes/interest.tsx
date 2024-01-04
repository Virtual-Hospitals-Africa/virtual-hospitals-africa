import { MailingListRecipient } from '../types.ts'
import { Handlers } from '$fresh/server.ts'
import { parseRequestAsserts } from '../util/parseForm.ts'
import * as slack from '../external-clients/slack.ts'
import * as mailing_list from '../db/models/mailing_list.ts'
import db from '../db/db.ts'
import redirect from '../util/redirect.ts'
import { assertOr400 } from '../util/assertOr.ts'
import isObjectLike from '../util/isObjectLike.ts'

function assertIsMailingListRecipient(
  formValues: unknown,
): asserts formValues is {
  name: string
  email: string
  interest?: string
  message?: string
  support?: string
} {
  assertOr400(isObjectLike(formValues))
  assertOr400('name' in formValues && typeof formValues['name'] == 'string')
  assertOr400('email' in formValues && typeof formValues['email'] == 'string')
  assertOr400(formValues['email'].includes('@'))
}

const successMessages = {
  '/waitlist': (name: string) =>
    `Thanks for joining the waitlist ${name}! We\'ll keep you in the loop about our progress 🚀`,
  '/schedule-demo': (name: string) =>
    `Thanks for your interest in a demo ${name}! We\'ll reach out shortly to schedule a time to connect ⏰`,
  '/partner': (name: string) =>
    `Thanks for your interest in partnership ${name}! We\'ll reach out shortly to discuss how we might work together 🤝`,
}

export const handler: Handlers = {
  async POST(req, ctx) {
    const referer = req.headers.get('referer')

    const formValues = await parseRequestAsserts(
      db,
      req,
      assertIsMailingListRecipient,
    )

    const recipient: MailingListRecipient = {
      ...formValues,
      entrypoint: referer || 'unknown',
    }

    await mailing_list.add(db, recipient)

    let slackMessage =
      `New interest from ${recipient.name} ${recipient.email}\n\nentrypoint: ${referer}`
    if (formValues.interest) {
      slackMessage += `\ninterest: ${formValues.interest}`
    }
    if (formValues.support) slackMessage += `\nsupport: ${formValues.support}`
    if (formValues.message) slackMessage += `\n\n"${formValues.message}"`

    await slack.send(slackMessage)

    const refererUrl = referer ? new URL(referer).pathname : null

    if (refererUrl && refererUrl in successMessages) {
      const success = successMessages
        [refererUrl as keyof typeof successMessages](recipient.name)
      return redirect(`/?success=${encodeURIComponent(success)}`)
    }

    return redirect(`/?success=${
      encodeURIComponent(
        `Thanks for signing up ${recipient.name}! We'll keep you in the loop about our progress 🚀`,
      )
    }`)
  },
}
