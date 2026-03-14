import db from '../db/db.ts'
import { ChatbotName, TrxOrDb, UnhandledMessage, WhatsApp } from '../types.ts'
import { determineResponse } from './determineResponse.ts'
import { conversations } from '../db/models/conversations.ts'
import capitalize from '../util/capitalize.ts'
import generateUUID from '../util/uuid.ts'
import { assert } from 'std/assert/assert.ts'
import { groupBy } from '../util/groupBy.ts'
import { forEach } from '../util/inParallel.ts'
import sortBy from '../util/sortBy.ts'

const error_family = Deno.env.get('ERROR_FAMILY') || generateUUID()
const on_production = Deno.env.get('ON_PRODUCTION')

async function respondToMessage(
  whatsapp: WhatsApp,
  unhandled_message: UnhandledMessage,
) {
  const { chatbot_name } = unhandled_message
  try {
    const response_to_send = await db
      .transaction()
      .setIsolationLevel('read committed')
      .execute((trx: TrxOrDb) => determineResponse(trx, unhandled_message))

    const whatsapp_responses = await whatsapp.sendMessages({
      messages: response_to_send,
      chatbot_name,
      phone_number: unhandled_message.sent_by_phone_number,
    })

    for (const whatsapp_response of whatsapp_responses) {
      if ('error' in whatsapp_response) {
        console.log('response_to_send', JSON.stringify(response_to_send))
        console.log('whatsapp_response', JSON.stringify(whatsapp_response))
        throw new Error(whatsapp_response.error.details)
      }

      await conversations.insertMessageSent(db, {
        chatbot_name: unhandled_message.chatbot_name,
        sent_by_phone_number: whatsapp.phone_number,
        sent_to_phone_number: unhandled_message.sent_by_phone_number,
        responding_to_received_id: unhandled_message.message_received_id,
        corresponding_message_id: null,
        whatsapp_id: whatsapp_response.messages[0].id,
        body: JSON.stringify(response_to_send),
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
        message_body: `An unknown error occured: ${err.message}`,
      },
      phone_number: unhandled_message.sent_by_phone_number,
    })

    await conversations.markChatbotError(db, {
      chatbot_name,
      commitHash: error_family,
      whatsapp_message_received_id: unhandled_message.message_received_id,
      error_message: err.message,
    })

    // if (on_production) {
    // const message = `*${capitalize(chatbot_name)} Chatbot Error*`

    // const github_code_href =
    //   `https://github.com/morehumaninternet/virtual-hospitals-africa/commit/${commitHash}`
    // const github_code_link = `<${github_code_href}|Github Commit>`

    // const logs_href = `https://dashboard.heroku.com/apps/vha-${unhandled_message.chatbot_name}-chatbot/logs`
    // const logs_link = `<${logs_href}|Heroku Logs>`

    // await sendToEngineeringChannel([
    //   message,
    //   err.message,
    //   // github_code_link,
    //   logs_link,
    // ].join('\n'))
    // }
  }
}

export default async function respond(
  whatsapp: WhatsApp,
  chatbot_name: ChatbotName,
  sent_by_phone_number?: string,
) {
  const unhandled_messages = await conversations.getUnhandledMessages(db, {
    chatbot_name,
    commitHash: error_family,
    sent_by_phone_number,
  })

  if (!unhandled_messages.length) return

  console.log('unhandled_messages', unhandled_messages)
  const by_phone_number = groupBy(unhandled_messages, 'sent_by_phone_number')

  return forEach(by_phone_number.values(), async (messages) => {
    // If we have a backlog of messages from a user, it's probably because the chatbot was down for some time.
    // In this case, handle them one by one in the order received
    for (const message of sortBy(messages, 'created_at')) {
      await respondToMessage(
        whatsapp,
        message,
      )
    }
  })
}
