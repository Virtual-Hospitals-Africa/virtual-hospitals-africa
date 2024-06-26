import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import {
  ChatbotName,
  ChatbotUserState,
  TrxOrDb,
  UnhandledMessage,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import * as defs from './defs.ts'
import { assert } from 'std/assert/assert.ts'

const sorry = (msg: string) => `Sorry, I didn't understand that.\n\n${msg}`

async function findOrInsertEntity(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
) {
  return (await trx
    .selectFrom(`${unhandled_message.chatbot_name}s`)
    .selectAll()
    .where('phone_number', '=', unhandled_message.sent_by_phone_number)
    .executeTakeFirst()) || (
      await trx
        .insertInto(`${unhandled_message.chatbot_name}s`)
        .values({
          phone_number: unhandled_message.sent_by_phone_number,
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    )
}

async function getPastConversationState(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  entity_id: string,
) {
  return (
    await trx.selectFrom(`${chatbot_name}_whatsapp_messages_received`)
      .innerJoin(
        'whatsapp_messages_received',
        'whatsapp_messages_received.id',
        `${chatbot_name}_whatsapp_messages_received.whatsapp_message_received_id`,
      )
      .select([
        `${chatbot_name}_whatsapp_messages_received.conversation_state`,
      ])
      .where(`${chatbot_name}_id`, '=', entity_id)
      .orderBy('whatsapp_messages_received.created_at', 'desc')
      .executeTakeFirst()
  )?.conversation_state
}

export async function determineResponse(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
): Promise<WhatsAppSingleSendable | WhatsAppSendable> {
  const entity = await findOrInsertEntity(trx, unhandled_message)

  const past_conversation_state = await getPastConversationState(
    trx,
    unhandled_message.chatbot_name,
    entity.id,
  )

  const userState: ChatbotUserState = {
    entity_id: entity.id,
    unhandled_message,
    chatbot_name: unhandled_message.chatbot_name,
    conversation_state:
      // deno-lint-ignore no-explicit-any
      past_conversation_state as any,
  }

  let nextConversationState
  let nextState

  if (!past_conversation_state) {
    nextConversationState = 'initial_message'
    nextState =
      defs[unhandled_message.chatbot_name].conversation_states.initial_message
  } else {
    const currentState = await findMatchingState(trx, userState)

    if (!currentState) {
      const originalMessageSent = {
        type: 'string' as const,
        messageBody: 'TODO get last message',
      }
      if (Array.isArray(originalMessageSent)) {
        return [
          {
            ...originalMessageSent[0],
            messageBody: sorry(originalMessageSent[0].messageBody),
          },
          {
            ...originalMessageSent[1],
            messageBody: sorry(originalMessageSent[1].messageBody),
          },
        ]
      } else {
        return {
          ...originalMessageSent,
          messageBody: sorry(originalMessageSent.messageBody),
        }
      }
    }

    nextConversationState = typeof currentState.onExit === 'string'
      ? currentState.onExit
      : await currentState.onExit(trx, userState)

    nextState =
      defs[userState.chatbot_name].conversation_states[nextConversationState]
  }

  await trx
    .insertInto(`${unhandled_message.chatbot_name}_whatsapp_messages_received`)
    .values({
      whatsapp_message_received_id: unhandled_message.message_received_id,
      conversation_state: nextConversationState as any,
      [`${unhandled_message.chatbot_name}_id`]: entity.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  console.log('nextConversationState', nextConversationState)
  assert(nextState, 'nextState not found')

  return await formatMessageToSend(trx, userState, nextState)
}
