import { z } from 'zod'
import * as discord from '../external-clients/discord.ts'
import redirect from '../util/redirect.ts'
import { CONTACT_REASON_OPTIONS, ContactReason } from '../components/library/ContactForm.tsx'
import { postHandler } from '../backend/postHandler.ts'
import db from '../db/db.ts'
import { mailing_list } from '../db/models/mailing_list.ts'

const contact_reasons = CONTACT_REASON_OPTIONS.map((o) => o.value) as [ContactReason, ...ContactReason[]]

const MailingListRecipientSchema = z.object({
  name: z.string(),
  email: z.string().includes('@'),
  entrypoint: z.enum(contact_reasons),
  interest: z.string().optional(),
  message: z.string().optional(),
  support: z.string().optional(),
})

const success_messages = {
  mailing_list_signup: (name: string) =>
    `Thanks for your interest ${name}! You're on the list and we're grateful you're part of the network of people interested in how technology can support health care in Africa 🌍`,
  general_inquiry: (name: string) => `Thanks for your interest ${name}! Our team has received your inquiry and will respond as soon as possible 🚀`,
  book_a_demo: (name: string) => `Thanks for your interest in a demo ${name}! We\'ll reach out shortly to schedule a time to connect ⏰`,
  book_an_intro_call: (name: string) => `Thanks for your interest in an intro call ${name}! We\'ll reach out shortly to schedule a time to connect ⏰`,
  request_investor_deck: (name: string) => `Thanks for your interest in a our investor deck ${name}! We\'ll reach out shortly to send it to you 🚀`,
}

export const handler = postHandler(
  MailingListRecipientSchema,
  async (_ctx, recipient) => {
    await discord.notifyMailingListSignup(recipient)
    await mailing_list.add(db, recipient)
    const success = success_messages[recipient.entrypoint](recipient.name)
    return redirect(`/thank-you?message=${encodeURIComponent(success)}`)
  },
)
