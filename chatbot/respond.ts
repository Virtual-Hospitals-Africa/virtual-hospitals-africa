import db from '../db/db.ts'
import {
  getUnhandledMessages,
  markChatbotError,
} from '../db/models/conversations.ts'
import {
  ChatbotName,
  TrxOrDb,
  UnhandledMessage,
  WhatsAppJSONResponse,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import { determineResponse } from './determineResponse.ts'
import { insertMessageSent } from '../db/models/conversations.ts'
import { sendToEngineeringChannel } from '../external-clients/slack.ts'
import capitalize from '../util/capitalize.ts'
import generateUUID from '../util/uuid.ts'

type WhatsApp = {
  phone_number: string
  sendMessage(opts: {
    phone_number: string
    chatbot_name: ChatbotName
    message: WhatsAppSingleSendable
  }): Promise<WhatsAppJSONResponse>
  sendMessages(opts: {
    phone_number: string
    chatbot_name: ChatbotName
    messages: WhatsAppSingleSendable | WhatsAppSendable
  }): Promise<WhatsAppJSONResponse[]>
}

const error_family = Deno.env.get('ERROR_FAMILY') || generateUUID()
console.log('error_family', error_family)
console.log('HEROKU_SLUG_COMMIT',  Deno.env.get('HEROKU_SLUG_COMMIT'))
const on_production = Deno.env.get('ON_PRODUCTION')

async function respondToMessage(
  whatsapp: WhatsApp,
  unhandled_message: UnhandledMessage
) {
  const { chatbot_name } = unhandled_message
  try {
    const responseToSend = await db
      .transaction()
      .setIsolationLevel('read committed')
      .execute((trx: TrxOrDb) =>
        determineResponse(trx, unhandled_message)
      )

    console.log('responseToSend', responseToSend)

    const whatsappResponses = await whatsapp.sendMessages({
      messages: responseToSend,
      chatbot_name,
      phone_number: unhandled_message.sent_by_phone_number,
    })
    console.log('whatsappResponses', whatsappResponses)

    for (const whatsappResponse of whatsappResponses) {
      if ('error' in whatsappResponse) {
        console.log('responseToSend', JSON.stringify(responseToSend))
        console.log('whatsappResponse', JSON.stringify(whatsappResponse))
        throw new Error(whatsappResponse.error.details)
      }

      await insertMessageSent(db, {
        chatbot_name: unhandled_message.chatbot_name,
        sent_by_phone_number: whatsapp.phone_number,
        sent_to_phone_number: unhandled_message.sent_by_phone_number,
        responding_to_received_id: unhandled_message.message_received_id,
        whatsapp_id: whatsappResponse.messages[0].id,
        body: JSON.stringify(responseToSend),
      })
    }
  } catch (err) {
    console.log('Error determining message to send')
    console.error(err)

    await whatsapp.sendMessage({
      chatbot_name,
      message: {
        type: 'string',
        messageBody: `An unknown error occured: ${err.message}`,
      },
      phone_number: unhandled_message.sent_by_phone_number,
    })

    await markChatbotError(db, {
      chatbot_name,
      commitHash: error_family,
      whatsapp_message_received_id: unhandled_message.message_received_id,
      errorMessage: err.message,
    })

    if (on_production) {
      const message = `*${capitalize(chatbot_name)} Chatbot Error*`

      // const github_code_href =
      //   `https://github.com/morehumaninternet/virtual-hospitals-africa/commit/${commitHash}`
      // const github_code_link = `<${github_code_href}|Github Commit>`

      const logs_href =
        `https://dashboard.heroku.com/apps/vha-${unhandled_message.chatbot_name}-chatbot/logs`
      const logs_link = `<${logs_href}|Heroku Logs>`

      await sendToEngineeringChannel([
        message,
        err.message,
        // github_code_link,
        logs_link,
      ].join('\n'))
    }
  }
}

export default async function respond(
  {
    whatsapp,
    chatbot_name,
    sent_by_phone_number,
  }: {
    whatsapp: WhatsApp,
    chatbot_name: ChatbotName,
    sent_by_phone_number?: string,
  }
) {
  const unhandledMessages = await getUnhandledMessages(db, {
    chatbot_name,
    commitHash: error_family,
    sent_by_phone_number,
  })

  if (unhandledMessages.length !== 0) {
    console.log('unhandledMessages', unhandledMessages)
  }

  return Promise.all(
    unhandledMessages.map((msg) =>
      respondToMessage(
        whatsapp,
        msg,
      )
    ),
  )
}
