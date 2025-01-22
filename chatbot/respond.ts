import db from '../db/db.ts'
import {
  getUnhandledMessages,
  markChatbotError,
} from '../db/models/conversations.ts'
import { ChatbotName, TrxOrDb, UnhandledMessage, WhatsApp } from '../types.ts'
import { determineResponse } from './determineResponse.ts'
import { insertMessageSent } from '../db/models/conversations.ts'
import { sendToEngineeringChannel } from '../external-clients/slack.ts'
import capitalize from '../util/capitalize.ts'
import generateUUID from '../util/uuid.ts'
import { assert } from 'std/assert/assert.ts'
import { groupBy } from '../util/groupBy.ts'
import { forEach } from '../util/inParallel.ts'
import sortBy from '../util/sortBy.ts'

const error_family = Deno.env.get('ERROR_FAMILY') || generateUUID()
console.log('error_family', error_family)
console.log('HEROKU_SLUG_COMMIT', Deno.env.get('HEROKU_SLUG_COMMIT'))
const on_production = Deno.env.get('ON_PRODUCTION')

async function respondToMessage(
  whatsapp: WhatsApp,
  unhandled_message: UnhandledMessage,
) {
  const { chatbot_name } = unhandled_message
  try {
    const responseToSend = await db
      .transaction()
      .setIsolationLevel('read committed')
      .execute((trx: TrxOrDb) => determineResponse(trx, unhandled_message))

    const whatsappResponses = await whatsapp.sendMessages({
      messages: responseToSend,
      chatbot_name,
      phone_number: unhandled_message.sent_by_phone_number,
    })

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

    // TODO: not always true?
    assert(err instanceof Error)

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
  whatsapp: WhatsApp,
  chatbot_name: ChatbotName,
  sent_by_phone_number?: string,
) {
  const unhandledMessages = await getUnhandledMessages(db, {
    chatbot_name,
    commitHash: error_family,
    sent_by_phone_number,
  })

  if (!unhandledMessages.length) return

  console.log('unhandledMessages', unhandledMessages)
  const by_phone_number = groupBy(unhandledMessages, 'sent_by_phone_number')

  return forEach(by_phone_number.values(), async (messages) => {
    for (const message of sortBy(messages, 'created_at')) {
      await respondToMessage(
        whatsapp,
        message,
      )
    }
  })
}
