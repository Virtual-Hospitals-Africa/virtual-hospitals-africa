import 'dotenv'
import {
  Clinic,
  WhatsAppJSONResponse,
  WhatsAppMessageAction,
  WhatsAppMessageOption,
  WhatsAppSendable,
} from '../types.ts'

const postMessageRoute = `https://graph.facebook.com/v17.0/${
  Deno.env.get(
    'WHATSAPP_FROM_PHONE_NUMBER',
  )
}/messages`
const Authorization = `Bearer ${Deno.env.get('WHATSAPP_BEARER_TOKEN')}`

export function sendMessage({
  message,
  phone_number,
}: {
  phone_number: string
  message: WhatsAppSendable
}): Promise<
  | WhatsAppJSONResponse
  | {
    messaging_product: 'whatsapp'
    contacts: [{ input: string; wa_id: string }]
    messages: [{ id: string }]
  }
> {
  switch (message.type) {
    case 'string': {
      return sendMessagePlainText({
        phone_number,
        message: message.messageBody,
      })
    }
    case 'buttons': {
      return sendMessageWithInteractiveButtons({
        phone_number,
        options: message.options,
        messageBody: message.messageBody,
      })
    }
    case 'list': {
      return sendMessageWithInteractiveList({
        phone_number,
        headerText: message.headerText,
        messageBody: message.messageBody,
        action: message.action,
      })
    }
    case 'location': {
      const clinic: Clinic = message.clinic
      return sendMessageLocation({
        phone_number,
        clinic,
      })
    }
  }
}

export async function sendMessageLocation(opts: {
  phone_number: string
  clinic: Clinic
}): Promise<WhatsAppJSONResponse> {
  const { longitude, latitude, name: clinicName, address } = opts.clinic

  const toPost = {
    method: 'post',
    headers: { Authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'messaging_product': 'whatsapp',
      'to': opts.phone_number,
      'type': 'location',
      'location': {
        'longitude': longitude,
        'latitude': latitude,
        'name': `Clinic: ${clinicName}`,
        'address': `Address: ${address}`,
      },
    }),
  }

  const response = await fetch(postMessageRoute, toPost)

  return response.json()
}

export async function sendMessageLocationRequest(opts: {
  phone_number: string
  messageBody: string
}): Promise<WhatsAppJSONResponse> {
  const toPost = {
    method: 'post',
    headers: { Authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: opts.phone_number,
      type: 'interactive',
      interactive: {
        'type': 'location_request_message',
        'body': {
          'type': 'text',
          'text': opts.messageBody,
        },
        'action': {
          'name': 'send_location',
        },
      },
    }),
  }

  console.log('toPostTest: \n', JSON.stringify(toPost))

  const response = await fetch(postMessageRoute, toPost)

  // console log not showing
  console.log(await response.text())

  return response.json()
}

export async function sendMessagePlainText(opts: {
  phone_number: string
  message: string
}): Promise<WhatsAppJSONResponse> {
  const response = await fetch(postMessageRoute, {
    method: 'post',
    headers: { Authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: opts.phone_number,
      text: { body: opts.message },
    }),
  })

  return response.json()
}

export async function sendMessageWithInteractiveButtons(opts: {
  phone_number: string
  messageBody: string
  options: WhatsAppMessageOption[]
}): Promise<WhatsAppJSONResponse> {
  const toPost = {
    method: 'post',
    headers: { Authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: opts.phone_number,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: opts.messageBody,
        },
        action: {
          buttons: opts.options.map((option) => ({
            type: 'reply',
            reply: option,
          })),
        },
      },
    }),
  }

  console.log('toPost\n', JSON.stringify(toPost))

  const response = await fetch(postMessageRoute, toPost)

  return response.json()
}

export async function sendMessageWithInteractiveList(opts: {
  phone_number: string
  headerText: string
  messageBody: string
  action: WhatsAppMessageAction
}): Promise<{
  messaging_product: 'whatsapp'
  contacts: [{ input: string; wa_id: string }]
  messages: [{ id: string }]
}> {
  const toPost = {
    method: 'post',
    headers: { Authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: opts.phone_number,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: opts.headerText },
        body: { text: opts.messageBody },
        action: opts.action,
      },
    }),
  }

  console.log('toPost\n', JSON.stringify(toPost))

  const response = await fetch(postMessageRoute, toPost)

  return response.json()
}
