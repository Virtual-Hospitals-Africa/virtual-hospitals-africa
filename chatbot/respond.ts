import db from '../db/db.ts'
import {
  getUnhandledPatientMessages,
  markChatbotError,
} from '../db/models/conversations.ts'
import {
  ChatbotName,
  ConversationStates,
  TrxOrDb,
  UserState,
  WhatsAppJSONResponse,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import { determineResponse } from './determineResponse.ts'
import { insertMessageSent } from '../db/models/conversations.ts'
import conversationStates from './patient/conversationStates.ts'
import { sendToEngineeringChannel } from '../external-clients/slack.ts'
import { updatePatientState } from './patient/util.ts'

type WhatsApp = {
  phone_number: string
  sendMessage(opts: {
    phone_number: string
    message: WhatsAppSingleSendable
  }): Promise<WhatsAppJSONResponse>
  sendMessages(opts: {
    phone_number: string
    messages: WhatsAppSingleSendable | WhatsAppSendable
  }): Promise<WhatsAppJSONResponse[]>
}

const commitHash = Deno.env.get('HEROKU_SLUG_COMMIT') || 'local'
const on_production = Deno.env.get('ON_PRODUCTION')

console.log('on_production', on_production)

async function respondToMessage<CS extends string, US extends UserState<CS>>(
  chatbot_name: ChatbotName,
  whatsapp: WhatsApp,
  conversationStates: ConversationStates<CS, US>,
  user_state: US,
  updateState: (trx: TrxOrDb, userState: US) => Promise<unknown>,
) {
  try {
    const responseToSend = await db
      .transaction()
      .setIsolationLevel('read committed')
      .execute((trx) =>
        determineResponse(
          trx,
          conversationStates,
          user_state,
          updateState,
        )
      )

    const whatsappResponses = await whatsapp.sendMessages({
      messages: responseToSend,
      phone_number: user_state.phone_number,
    })

    for (const whatsappResponse of whatsappResponses) {
      if ('error' in whatsappResponse) {
        console.log('responseToSend', JSON.stringify(responseToSend))
        console.log('whatsappResponse', JSON.stringify(whatsappResponse))
        throw new Error(whatsappResponse.error.details)
      }

      await insertMessageSent(db, {
        chatbot_name,
        sent_by_phone_number: whatsapp.phone_number,
        sent_to_phone_number: user_state.phone_number,
        responding_to_received_id: user_state.message_id,
        whatsapp_id: whatsappResponse.messages[0].id,
        body: JSON.stringify(responseToSend),
      })
    }
  } catch (err) {
    console.log('Error determining message to send')
    console.error(err)

    await whatsapp.sendMessage({
      message: {
        type: 'string',
        messageBody: `An unknown error occured: ${err.message}`,
      },
      phone_number: user_state.phone_number,
    })

    await markChatbotError(db, {
      chatbot_name,
      commitHash,
      whatsapp_message_received_id: user_state.message_id,
      errorMessage: err.message,
    })

    console.log('on_production', on_production)
    if (on_production) {
      const github_code_href =
        `https://github.com/morehumaninternet/virtual-hospitals-africa/commit/${commitHash}`
      const github_code_link = `<${github_code_href}|Github Commit>`

      const logs_href =
        'https://dashboard.heroku.com/apps/vha-patient-chatbot/logs'
      const logs_link = `<${logs_href}|Heroku Logs>`

      const message = [
        '*Patient Chatbot Error*',
        err.message,
        github_code_link,
        logs_link,
      ].join('\n')

      await sendToEngineeringChannel(message)
    }
  }
}

export default async function respond(
  whatsapp: WhatsApp,
  chatbot_name: ChatbotName,
  phone_number?: string,
) {
  const unhandledMessages = await getUnhandledPatientMessages(db, {
    commitHash,
    phone_number,
  })

  if (unhandledMessages.length !== 0) {
    console.log('unhandledMessages', unhandledMessages)
  }

  return Promise.all(
    unhandledMessages.map((msg: unknown) =>
      respondToMessage(
        chatbot_name,
        whatsapp,
        conversationStates,
        // deno-lint-ignore no-explicit-any
        msg as any,
        chatbot_name === 'patient' ? updatePatientState : () => {
          throw new Error('Not implemented')
        },
      )
    ),
  )
}
