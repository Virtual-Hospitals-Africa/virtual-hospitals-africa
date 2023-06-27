import { Handlers } from '$fresh/server.ts'
import db from '../../db/db.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as whatsapp from '../../external-clients/whatsapp.ts'
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

    // {"object":"whatsapp_business_account","entry":[{"id":"103992419238259","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"263784010987","phone_number_id":"100667472910572"},"contacts":[{"profile":{"name":"Will Weiss"},"wa_id":"12032535603"}],"messages":[{"from":"12032535603","id":"wamid.HBgLMTIwMzI1MzU2MDMVAgASGBQzQTg1RUZDMDJFNDE2NDg2MkZBQgA=","timestamp":"1687807194","type":"audio","audio":{"mime_type":"audio/ogg; codecs=opus","sha256":"sQMkSRNvd9udZqPeZfO5T/UOMT1zYEh//aitgp9dS8c=","id":"1834915043569604","voice":true}}]},"field":"messages"}]}]}

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

      if (message.type === 'audio') {
        const mediaResponse = await whatsapp.get(message.audio.id)
        console.log('HERE IS YOUR audio', mediaResponse)
        return new Response('OK')
      } else if (message.type === 'image') {
        const mediaResponse = await whatsapp.get(message.image.id)
        console.log('HERE IS YOUR image', mediaResponse)
        // TODO handle this
        return new Response('OK')
      } else if (message.type === 'video') {
        const mediaResponse = await whatsapp.get(message.video.id)
        console.log('HERE IS YOUR video', mediaResponse)
        // TODO handle this
        return new Response('OK')
      } else if (message.type === 'document') {
        const mediaResponse = await whatsapp.get(message.document.id)
        console.log('HERE IS YOUR document', mediaResponse)
        // TODO handle this
        return new Response('OK')
      } else if (message.type === 'contacts') {
        // TODO handle this
        return new Response('OK')
      }

      const body = message.type === 'text'
        ? message.text.body
        : message.type === 'location' // TODO: check the location format
        ? JSON.stringify(message.location)
        // : message.type === 'audio'
        // ? message.audio
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

// TODO handle messages like this {"object":"whatsapp_business_account","entry":[{"id":"103214822804490","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"263712093355","phone_number_id":"113792741736396"},"messages":[{"from":"263782057099","id":"wamid.HBgMMjYzNzgyMDU3MDk5FQIAEhgSNDY4MDg4NzBCQkEyRjg3Q0M5AA==","timestamp":"1687676124","system":{"body":"User A changed from ‎263782057099 to 263719057099‎","wa_id":"263719057099","type":"user_changed_number"},"type":"system"}]},"field":"messages"}]}]}
