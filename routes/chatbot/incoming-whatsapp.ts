import { Handlers } from '$fresh/server.ts'
import db from '../../db/db.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as media from '../../db/models/media.ts'
import * as whatsapp from '../../external-clients/whatsapp.ts'
import {
  WhatsAppIncomingMessage,
  WhatsAppMessage,
  WhatsAppMessageContents,
} from '../../types.ts'

const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN')

async function downloadAndInsertMedia(media_id: string) {
  const { url, mime_type } = await whatsapp.get(media_id)
  const binary_data = await whatsapp.getBinaryData(url)
  const insertedMedia = await media.insert(db, {
    binary_data,
    mime_type,
    file_name: 'patient_media',
  })
  return insertedMedia.id
}

async function getContents(
  message: WhatsAppMessage,
): Promise<WhatsAppMessageContents> {
  switch (message.type) {
    case 'audio':
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.audio.id),
        body: null,
      }
    case 'video':
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.video.id),
        body: null,
      }
    case 'document':
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.document.id),
        body: null,
      }
    case 'image':
      return {
        has_media: true,
        media_id: await downloadAndInsertMedia(message.image.id),
        body: null,
      }
    case 'text':
      return { has_media: false, media_id: null, body: message.text.body }

    case 'location':
      return {
        has_media: false,
        media_id: null,
        body: JSON.stringify(message.location),
      }

    case 'interactive': {
      const body = message.interactive.type === 'list_reply'
        ? message.interactive.list_reply.id
        : message.interactive.button_reply.id
      return { has_media: false, media_id: null, body }
    }
    case 'contacts': {
      throw new Error('Not yet handled')
    }
    default: {
      throw new Error('Unknown message.type')
    }
  }
}

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

      const contents = await getContents(message)

      await conversations.insertMessageReceived(db, {
        patient_phone_number: message.from,
        whatsapp_id: message.id,
        ...contents,
      })
    }

    return new Response('OK')
  },
  // TODO handle messages like this {"object":"whatsapp_business_account","entry":[{"id":"103214822804490","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"263712093355","phone_number_id":"113792741736396"},"messages":[{"from":"263782057099","id":"wamid.HBgMMjYzNzgyMDU3MDk5FQIAEhgSNDY4MDg4NzBCQkEyRjg3Q0M5AA==","timestamp":"1687676124","system":{"body":"User A changed from ‎263782057099 to 263719057099‎","wa_id":"263719057099","type":"user_changed_number"},"type":"system"}]},"field":"messages"}]}]}
}
