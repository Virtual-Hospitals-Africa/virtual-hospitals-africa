import { m as assert, d as db, r as redirect, F as object, G as string, _ as _enum } from "../server-entry.mjs";
import { C as CONTACT_REASON_OPTIONS } from "./ContactForm-a3R3cKtH.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const DISCORD_MAILING_LIST_WEBHOOK_URL = Deno.env.get("DISCORD_MAILING_LIST_WEBHOOK_URL");
async function notifyMailingListSignup(recipient) {
  assert(DISCORD_MAILING_LIST_WEBHOOK_URL, `DISCORD_MAILING_LIST_WEBHOOK_URL must be set`);
  let content = `🎉 **New Subscriber!**

${recipient.name} ${recipient.email}`;
  if (recipient.entrypoint) content += `
entrypoint: ${recipient.entrypoint}`;
  if (recipient.interest) content += `
interest: ${recipient.interest}`;
  if (recipient.support) content += `
support: ${recipient.support}`;
  if (recipient.message) content += `

"${recipient.message}"`;
  await fetch(DISCORD_MAILING_LIST_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content
    })
  });
}
const mailing_list = {
  add(trx, recipient) {
    return trx.insertInto("mailing_list").values(recipient).execute();
  }
};
const MAILERLITE_API_TOKEN = Deno.env.get("MAILERLITE_API_TOKEN");
async function addSubscriber(recipient) {
  assert(MAILERLITE_API_TOKEN, `MAILERLITE_API_TOKEN must be set`);
  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MAILERLITE_API_TOKEN}`
    },
    body: JSON.stringify({
      email: recipient.email,
      fields: {
        name: recipient.name,
        entrypoint: recipient.entrypoint,
        ...recipient.interest && {
          interest: recipient.interest
        },
        ...recipient.message && {
          message: recipient.message
        },
        ...recipient.support && {
          support: recipient.support
        }
      }
    })
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MailerLite addSubscriber failed: ${response.status} ${body}`);
  }
}
const contact_reasons = CONTACT_REASON_OPTIONS.map((o) => o.value);
const MailingListRecipientSchema = object({
  name: string(),
  email: string().includes("@"),
  entrypoint: _enum(contact_reasons),
  interest: string().optional(),
  message: string().optional(),
  support: string().optional()
});
const success_messages = {
  mailing_list_signup: (name) => `Thanks for your interest ${name}! You're on the list and we're grateful you're part of the network of people interested in how technology can support health care in Africa 🌍`,
  general_inquiry: (name) => `Thanks for your interest ${name}! Our team has received your inquiry and will respond as soon as possible 🚀`,
  book_a_demo: (name) => `Thanks for your interest in a demo ${name}! We'll reach out shortly to schedule a time to connect ⏰`,
  book_an_intro_call: (name) => `Thanks for your interest in an intro call ${name}! We'll reach out shortly to schedule a time to connect ⏰`,
  request_investor_deck: (name) => `Thanks for your interest in a our investor deck ${name}! We'll reach out shortly to send it to you 🚀`
};
const handler$1 = postHandler(MailingListRecipientSchema, async (_ctx, recipient) => {
  await addSubscriber(recipient);
  await notifyMailingListSignup(recipient);
  await mailing_list.add(db, recipient);
  const success = success_messages[recipient.entrypoint](recipient.name);
  return redirect(`/thank-you?message=${encodeURIComponent(success)}`);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___interest = void 0;
export {
  config,
  css,
  _freshRoute___interest as default,
  handler,
  handlers
};
