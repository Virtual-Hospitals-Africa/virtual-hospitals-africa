import 'dotenv'
import {
  WhatsAppJSONResponse,
  WhatsAppLocation,
  WhatsAppMessageAction,
  WhatsAppMessageOption,
  WhatsAppSendable,
  WhatsAppSendables,
} from '../types.ts'

const postMessageRoute = `https://graph.facebook.com/v17.0/${
  Deno.env.get(
    'WHATSAPP_FROM_PHONE_NUMBER',
  )
}/messages`
const Authorization = `Bearer ${Deno.env.get('WHATSAPP_BEARER_TOKEN')}`

export async function get(path: string) {
  const response = await fetch(`https://graph.facebook.com/v17.0/${path}`, {
    headers: { Authorization, 'content-type': 'application/json' },
  })
  return response.json()
}

export function sendMessage({
  message,
  phone_number,
}: {
  phone_number: string
  message: WhatsAppSendable
}): Promise<WhatsAppJSONResponse> {
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
      return sendMessageLocation({
        phone_number,
        location: message.location,
      })
    }
  }
}

export function sendMessages({
  messages,
  phone_number,
}: {
  phone_number: string
  messages: WhatsAppSendables
}): Promise<WhatsAppJSONResponse[]> {
  // Send the first message
  const firstMessagePromise = sendMessage({
    phone_number,
    message: messages[0],
  })

  // Send the second message
  const secondMessagePromise = sendMessage({
    phone_number,
    message: messages[1],
  })

  // Wait for both messages to send and then return the array of responses
  return Promise.all([firstMessagePromise, secondMessagePromise])
}

export async function postMessage(body: unknown) {
  const toPost = {
    method: 'post',
    headers: { Authorization, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }

  const response = await fetch(postMessageRoute, toPost)

  return response.json()
}

export function sendMessageLocation(opts: {
  phone_number: string
  location: WhatsAppLocation
}): Promise<WhatsAppJSONResponse> {
  return postMessage({
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'location',
    location: opts.location,
  })
}

export function sendMessageLocationRequest(opts: {
  phone_number: string
  messageBody: string
}): Promise<WhatsAppJSONResponse> {
  return postMessage({
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
  })
}

export function sendMessagePlainText(opts: {
  phone_number: string
  message: string
}): Promise<WhatsAppJSONResponse> {
  return postMessage({
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    text: { body: opts.message },
  })
}

export function sendMessageWithInteractiveButtons(opts: {
  phone_number: string
  messageBody: string
  options: WhatsAppMessageOption[]
}): Promise<WhatsAppJSONResponse> {
  return postMessage({
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
  })
}

export function sendMessageWithInteractiveList(opts: {
  phone_number: string
  headerText: string
  messageBody: string
  action: WhatsAppMessageAction
}): Promise<{
  messaging_product: 'whatsapp'
  contacts: [{ input: string; wa_id: string }]
  messages: [{ id: string }]
}> {
  return postMessage({
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: opts.headerText },
      body: { text: opts.messageBody },
      action: opts.action,
    },
  })
}
