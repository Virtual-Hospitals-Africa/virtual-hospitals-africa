import { ChatbotName } from '../db.d.ts'
import {
  WhatsAppJSONResponse,
  WhatsAppLocation,
  WhatsAppMessageAction,
  WhatsAppMessageOption,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import { basename } from 'node:path'
import { deletePDF, generatePDF } from '../util/pdfUtils.ts'
import { delay } from '../util/delay.ts'

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
  //unique hash
  //{"chatbot_name":"pharmacist","message":{"type":"string","messageBody":"An unknown error occured: Cannot find a pharmacist with that licence and name combination"},"phone_number":"12369961017"}

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
        pdfPath: message.file_path,
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

// Upload a file and get the id
export async function postMedia(
  filePath: string,
  fileType: string,
  chatbot_name: ChatbotName,
): Promise<string> {
  const fileContent = await Deno.readFile(filePath)
  const fileBlob = new Blob([fileContent], { type: fileType })
  const formData = new FormData()

  formData.append('file', fileBlob, basename(filePath))
  formData.append('type', fileType)
  formData.append('messaging_product', 'whatsapp')

  const toPost = {
    method: 'post',
    headers: { 'Authorization': `${Authorization}` },
    body: formData,
  }
  const postMessageRoute = `https://graph.facebook.com/v20.0/${
    phoneNumbers[chatbot_name]
  }/media`

  const response = await fetch(postMessageRoute, toPost)
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
  messaging_product: 'whatsapp'
  contacts: [{ input: string; wa_id: string }]
  messages: [{ id: string }]
}> {
  const filename = basename(opts.pdfPath)
  const mediaId = await postMedia(
    opts.pdfPath,
    'application/pdf',
    opts.chatbot_name,
  )

  return await postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'document',
    document: {
      id: mediaId,
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
  const pdfPath = await generatePDF(opts.url)
  const filename = basename(pdfPath)
  const mediaId = await postMedia(pdfPath, 'application/pdf', opts.chatbot_name)
  deletePDF(pdfPath)

  return await postMessage(opts.chatbot_name, {
    messaging_product: 'whatsapp',
    to: opts.phone_number,
    type: 'document',
    document: {
      id: mediaId,
      caption: opts.message,
      filename: filename,
    },
  })
}
