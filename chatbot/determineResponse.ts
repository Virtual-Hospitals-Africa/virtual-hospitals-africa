import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import {
  ChatbotUserState,
  TrxOrDb,
  UnhandledMessage,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import * as defs from './defs.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../util/isObjectLike.ts'

async function findOrInsertChatbotUser(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
) {
  return (await trx
    .selectFrom(`${unhandled_message.chatbot_name}_chatbot_users`)
    .selectAll()
    .where('phone_number', '=', unhandled_message.sent_by_phone_number)
    .executeTakeFirst()) || (
      await trx
        .insertInto(`${unhandled_message.chatbot_name}_chatbot_users`)
        .values({
          phone_number: unhandled_message.sent_by_phone_number,
          data: '',
          conversation_state: 'initial_message',
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    )
}

export async function determineResponse(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
): Promise<WhatsAppSingleSendable | WhatsAppSendable> {
  // deno-lint-ignore no-explicit-any
  const conversation_states: any =
    defs[unhandled_message.chatbot_name].conversation_states

  const chatbot_user = await findOrInsertChatbotUser(trx, unhandled_message)

  const userState: ChatbotUserState = {
    chatbot_user_id: chatbot_user.id,
    chatbot_user_data: isObjectLike(chatbot_user.data) ? chatbot_user.data : {},
    entity_id: chatbot_user.entity_id,
    unhandled_message,
    chatbot_name: unhandled_message.chatbot_name,
    // deno-lint-ignore no-explicit-any
    conversation_state: chatbot_user.conversation_state as any,
  }

  let nextConversationState: string
  let nextState

  if (!chatbot_user) {
    nextConversationState = 'initial_message'
    nextState = conversation_states.initial_message
  } else {
    const currentState = await findMatchingState(trx, userState)

    if (!currentState) {
      nextConversationState = 'error'
      nextState = defs[userState.chatbot_name].conversation_states.error
    } else {
      nextConversationState = typeof currentState.onExit === 'string'
        ? currentState.onExit
        : await currentState.onExit(trx, userState)

      nextState = conversation_states[nextConversationState]
    }
  }

  await trx.updateTable(`${unhandled_message.chatbot_name}_chatbot_users`)
    .set('conversation_state', nextConversationState)
    .where('id', '=', chatbot_user.id)
    .execute()

  await trx
    .insertInto(
      `${unhandled_message.chatbot_name}_chatbot_user_whatsapp_messages_received`,
    )
    .values({
      whatsapp_message_received_id: unhandled_message.message_received_id,
      // deno-lint-ignore no-explicit-any
      conversation_state: nextConversationState as any,
      chatbot_user_id: chatbot_user.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  console.log('nextConversationState', nextConversationState)
  assert(nextState, 'nextState not found')

  return await formatMessageToSend(trx, userState, nextState)
}
