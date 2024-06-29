import { ChatbotName } from '../db.d.ts'
import {
  WhatsAppJSONResponse,
  WhatsAppLocation,
  WhatsAppMessageAction,
  WhatsAppMessageOption,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import { uploadMedia } from './uploadMedia.ts'
import { basename } from 'node:path'

const phoneNumbers = {
  patient: Deno.env.get('WHATSAPP_FROM_PHONE_NUMBER_PATIENT')!,
  pharmacist: Deno.env.get('WHATSAPP_FROM_PHONE_NUMBER_PHARMACIST')!,
}

const Authorization = `Bearer ${Deno.env.get('WHATSAPP_BEARER_TOKEN')}`

export async function get(path: string) {
  const response = await fetch(`https://graph.facebook.com/v17.0/${path}`, {
    headers: {
      Authorization,
      'Content-Type': 'application/json',
    },
  })
  return response.json()
}
export async function getBinaryData(path: string): Promise<Uint8Array> {
  const response = await fetch(path, {
    headers: {
      Authorization,
      'User-Agent': 'Deno prod',
    },
  })
  const ab = await response.arrayBuffer()
  return new Uint8Array(ab)
}

const RECENTLY_SENT_MESSAGES = new Set()

export function sendMessage(opts: {
  phone_number: string
  chatbot_name: ChatbotName
  message: WhatsAppSingleSendable
}): Promise<WhatsAppJSONResponse> {
  
  const message_unique_hash = JSON.stringify(opts)
  if (RECENTLY_SENT_MESSAGES.has(message_unique_hash)) {
    console.error("Sending duplicate message to the same number. Is it possible the chatbot is running elsewhere?")
    Deno.exit(1)
  }
  RECENTLY_SENT_MESSAGES.add(message_unique_hash)
  setTimeout(() => RECENTLY_SENT_MESSAGES.delete(message_unique_hash), 10000)

  const {
    message,
    chatbot_name,
    phone_number,
  } = opts
  
  switch (message.type) {
    case 'string': {
      return sendMessagePlainText({
        phone_number,
        chatbot_name,
        message: message.messageBody,
      })
    }
    case 'buttons': {
      return sendMessageWithInteractiveButtons({
        phone_number,
        chatbot_name,
        options: message.options,
        messageBody: message.messageBody,
      })
    }
    case 'list': {
      return sendMessageWithInteractiveList({
        phone_number,
        chatbot_name,
        headerText: message.headerText,
        messageBody: message.messageBody,
        action: message.action,
      })
    }
    case 'location': {
      return sendMessageLocation({
        phone_number,
        chatbot_name,
        location: message.location,
      })
    }
    case 'document': {
      return sendMessagePDF({
        phone_number,
        chatbot_name,
        message: message.messageBody,
        pdfPath: message.pdfPath,
      })
    }
  }
}

export function sendMessages({
  phone_number,
  chatbot_name,
  messages,
}: {
  phone_number: string
  chatbot_name: ChatbotName
  messages: WhatsAppSingleSendable | WhatsAppSendable
}): Promise<WhatsAppJSONResponse[]> {
  // Convert the single message to an array for consistent handling
  const messagesArray = Array.isArray(messages) ? messages : [messages]

  // Create an array to hold our promises
  const messagePromises: Promise<WhatsAppJSONResponse>[] = []

  // Send the first message
  messagePromises.push(sendMessage({
    phone_number,
    chatbot_name,
    message: messagesArray[0],
  }))

  // Chain a delay and a potential second message send if a second message exists
  if (messagesArray[1]) {
    const secondMessagePromise = messagePromises[0]
      /* setTimeout() function in chatbot.ts has a delay of 100 milliseconds,
         so time gap between two message must be less than 100 */
      .then(() => new Promise((resolve) => setTimeout(resolve, 10)))
      .then(() =>
        sendMessage({ phone_number, chatbot_name, message: messagesArray[1] })
      )
    messagePromises.push(secondMessagePromise)
  }

  // Wait for all promises to resolve, then return the array of responses
  return Promise.all(messagePromises)
}

export async function postMessage(chatbot_name: ChatbotName, body: unknown) {
  const toPost = {
    method: 'post',
    headers: { Authorization, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }

  const postMessageRoute = `https://graph.facebook.com/v17.0/${
    phoneNumbers[chatbot_name]
  }/messages`
  const response = await fetch(postMessageRoute, toPost)

  return response.json()
}

export function sendMessageLocation(opts: {
  phone_number: string
  chatbot_name: ChatbotName
  location: WhatsAppLocation
}): Promise<WhatsAppJSONResponse> {
  return postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'location',
    location: opts.location,
  })
}

export function sendMessageLocationRequest(opts: {
  phone_number: string
  chatbot_name: ChatbotName
  messageBody: string
}): Promise<WhatsAppJSONResponse> {
  return postMessage(opts.chatbot_name, {
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
  chatbot_name: ChatbotName
  message: string
}): Promise<WhatsAppJSONResponse> {
  return postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    text: { body: opts.message },
  })
}

export function sendMessageWithInteractiveButtons(opts: {
  phone_number: string
  chatbot_name: ChatbotName
  messageBody: string
  options: WhatsAppMessageOption[]
}): Promise<WhatsAppJSONResponse> {
  return postMessage(opts.chatbot_name, {
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
  chatbot_name: ChatbotName
  headerText: string
  messageBody: string
  action: WhatsAppMessageAction
}): Promise<{
  messaging_product: 'whatsapp'
  contacts: [{ input: string; wa_id: string }]
  messages: [{ id: string }]
}> {
  return postMessage(opts.chatbot_name, {
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

export async function sendMessagePDF(opts: {
  phone_number: string
  chatbot_name: ChatbotName
  message: string
  pdfPath: string
}): Promise<{
  messaging_product: 'whatsapp',
  contacts: [{ input: string; wa_id: string }],
  messages: [{ id: string }]
}> {
  const filename = basename(opts.pdfPath);
  const mediaId = await uploadMedia(opts.pdfPath, 'application/pdf');

  return await postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'document',
    document: {
      id: mediaId,
      caption: opts.message,
      filename: filename
    }
  })
}