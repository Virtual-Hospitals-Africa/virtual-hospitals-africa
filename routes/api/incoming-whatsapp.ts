import { Handlers } from '$fresh/server.ts'
import db from '../../db/db.ts'
import * as conversations from '../../db/models/conversations.ts'
import { WhatsAppIncomingMessage } from '../../types.ts'

const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN')

/*
  Handle the webhook from WhatsApp
  https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
  We don't respond to the user directly in this handler, we only put the message in the DB
  To be handled later
*/
export const handler: Handlers = {
  GET(req) {
    const { searchParams } = new URL(req.url)
    const hubMode = searchParams.get('hub.mode')
    const hubVerifyToken = searchParams.get('hub.verify_token')
    const hubChallenge = searchParams.get('hub.challenge')

    if (hubMode === 'subscribe' && hubVerifyToken === verifyToken) {
      return new Response(hubChallenge)
    }
    return new Response('Invalid token')
  },
  async POST(req) {
    const incomingMessage: WhatsAppIncomingMessage = await req.json()

    console.log(JSON.stringify(incomingMessage))

    if (incomingMessage.object !== 'whatsapp_business_account') {
      console.error('Object is not whatsapp_business_account')
      return new Response('Unexpected object', { status: 400 })
    }
    const [entry, ...otherEntries] = incomingMessage.entry
    if (otherEntries.length) {
      console.error('More than one entry in the message, that\'s weird')
    }

    const [change, ...otherChanges] = entry.changes
    if (otherChanges.length) {
      console.error('More than one change in the entry, that\'s weird')
    }

    if (change.value.statuses) {
      const [status, ...otherStatuses] = change.value.statuses
      if (otherStatuses.length) {
        console.error('More than one status in the change, that\'s weird')
      }
      await conversations.updateReadStatus(db, {
        whatsapp_id: status.id,
        read_status: status.status,
      })
    }

    if (change.value.messages) {
      const [message, ...otherMessages] = change.value.messages
      if (otherMessages.length) {
        console.error('More than one message in the change, that\'s weird')
      }
      const timestamp = 1000 * parseInt(message.timestamp, 10)
      const now = Date.now()
      console.log(`now: ${now} Message timestamp ${timestamp}`)

      if (now - timestamp > 1000 * 60 * 10) {
        console.error('Message is more than ten minutes old')
        return new Response('Message is more than ten minutes old', {
          status: 400,
        })
      }

      const body = message.type === 'text'
        ? message.text.body
        : message.type === 'location'               // TODO: check the location format
        ? JSON.stringify(message.location)
        : message.interactive.type === 'list_reply'
        ? message.interactive.list_reply.id
        : message.interactive.button_reply.id

      await conversations.insertMessageReceived(db, {
        body,
        patient_phone_number: message.from,
        whatsapp_id: message.id,
      })
    }

    return new Response('OK')
  },
}
