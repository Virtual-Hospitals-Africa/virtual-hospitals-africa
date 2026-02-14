import { z } from 'zod'
import { parseRequest } from '../backend/parseForm.ts'
import * as slack from '../external-clients/slack.ts'
import redirect from '../util/redirect.ts'
import { CONTACT_REASON_OPTIONS, ContactReason } from '../components/library/ContactForm.tsx'
import { Handlers } from 'fresh/compat'

const contact_reasons = CONTACT_REASON_OPTIONS.map((o) => o.value) as [ContactReason, ...ContactReason[]]

const MailingListRecipientSchema = z.object({
  name: z.string(),
  email: z.string().includes('@'),
  reason: z.enum(contact_reasons),
  interest: z.string().optional(),
  message: z.string().optional(),
  support: z.string().optional(),
})

const success_messages = {
  general_inquiry: (name: string) => `Thanks for your interest ${name}! Our team has received your inquiry and will respond as soon as possible 🚀`,
  book_a_demo: (name: string) => `Thanks for your interest in a demo ${name}! We\'ll reach out shortly to schedule a time to connect ⏰`,
  book_an_intro_call: (name: string) => `Thanks for your interest in an intro call ${name}! We\'ll reach out shortly to schedule a time to connect ⏰`,
  request_investor_deck: (name: string) => `Thanks for your interest in a our investor deck ${name}! We\'ll reach out shortly to send it to you 🚀`,
}

export const handler: Handlers = {
  async POST(ctx) {
    const recipient = await parseRequest(
      ctx.req,
      (obj) => MailingListRecipientSchema.parse(obj),
    )

    // await mailing_list.add(db, recipient)

    let slackMessage = `New interest from ${recipient.name} ${recipient.email}\n\nreason: ${recipient.reason}`
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
