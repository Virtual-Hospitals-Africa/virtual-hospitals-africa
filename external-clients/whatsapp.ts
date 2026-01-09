import { ChatbotName } from '../db.d.ts'
import {
  WhatsAppJSONResponse,
  WhatsAppLocation,
  WhatsAppMessageAction,
  WhatsAppMessageOption,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import { basename } from 'std/path/mod.ts'
import * as pdf from '../util/pdf.ts'
import { delay } from '../util/delay.ts'

export const phone_numbers = {
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
    console.error(
      'Sending duplicate message to the same number. Is it possible the chatbot is running elsewhere?',
    )
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
        message: message.message_body,
      })
    }
    case 'buttons': {
      return sendMessageWithInteractiveButtons({
        phone_number,
        chatbot_name,
        options: message.options,
        message_body: message.message_body,
      })
    }
    case 'list': {
      return sendMessageWithInteractiveList({
        phone_number,
        chatbot_name,
        headerText: message.headerText,
        message_body: message.message_body,
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
        message: message.message_body,
        pdf_path: message.file_path,
      })
    }
  }
}

export async function sendMessages({
  phone_number,
  chatbot_name,
  messages,
}: {
  phone_number: string
  chatbot_name: ChatbotName
  messages: WhatsAppSingleSendable | WhatsAppSendable
}): Promise<WhatsAppJSONResponse[]> {
  if (!Array.isArray(messages)) {
    return [
      await sendMessage({ phone_number, chatbot_name, message: messages }),
    ]
  }

  const responses: WhatsAppJSONResponse[] = []
  for (const message of messages) {
    const response = await sendMessage({ phone_number, chatbot_name, message })
    responses.push(response)
    await delay(300)
  }
  return responses
}

export async function postMessage(chatbot_name: ChatbotName, body: unknown) {
  const to_post = {
    method: 'post',
    headers: { Authorization, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }

  const post_message_route = `https://graph.facebook.com/v17.0/${
    phone_numbers[chatbot_name]
  }/messages`
  const response = await fetch(post_message_route, to_post)

  return response.json()
}

// Upload a file and get the id
export async function postMedia(
  file_path: string,
  fileType: string,
  chatbot_name: ChatbotName,
): Promise<string> {
  const file_content = await Deno.readFile(file_path)
  const file_blob = new Blob([file_content], { type: fileType })
  const form_data = new FormData()

  form_data.append('file', file_blob, basename(file_path))
  form_data.append('type', fileType)
  form_data.append('messaging_product', 'whatsapp')

  const to_post = {
    method: 'post',
    headers: { 'Authorization': `${Authorization}` },
    body: form_data,
  }
  const post_message_route = `https://graph.facebook.com/v20.0/${
    phone_numbers[chatbot_name]
  }/media`

  const response = await fetch(post_message_route, to_post)
  if (!response.ok) {
    throw new Error(`Error uploading media: ${response.statusText}`)
  }
  const result = await response.json()
  return result.id
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
  message_body: string
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
        'text': opts.message_body,
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
  message_body: string
  options: WhatsAppMessageOption[]
}): Promise<WhatsAppJSONResponse> {
  return postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: opts.message_body,
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
  message_body: string
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
      body: { text: opts.message_body },
      action: opts.action,
    },
  })
}

export async function sendMessagePDF(opts: {
  phone_number: string
  chatbot_name: ChatbotName
  message: string
  pdf_path: string
}): Promise<{
  messaging_product: 'whatsapp'
  contacts: [{ input: string; wa_id: string }]
  messages: [{ id: string }]
}> {
  const filename = basename(opts.pdf_path)
  const media_id = await postMedia(
    opts.pdf_path,
    'application/pdf',
    opts.chatbot_name,
  )

  return await postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'document',
    document: {
      id: media_id,
      caption: opts.message,
      filename: filename,
    },
  })
}

export async function sendMessagePDFFromWebPage(opts: {
  phone_number: string
  chatbot_name: ChatbotName
  message: string
  url: string
}): Promise<{
  messaging_product: 'whatsapp'
  contacts: [{ input: string; wa_id: string }]
  messages: [{ id: string }]
}> {
  const pdf_path = await pdf.generate(opts.url)
  const filename = basename(pdf_path)
  const media_id = await postMedia(
    pdf_path,
    'application/pdf',
    opts.chatbot_name,
  )

  Deno.remove(pdf_path).catch(console.error)

  return postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'document',
    document: {
      id: media_id,
      caption: opts.message,
      filename,
    },
  })
}
