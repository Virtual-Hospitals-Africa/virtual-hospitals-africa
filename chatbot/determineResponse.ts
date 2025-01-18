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
import * as conversations from '../db/models/conversations.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../util/isObjectLike.ts'

export async function determineResponse(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
): Promise<WhatsAppSingleSendable | WhatsAppSendable> {
  // deno-lint-ignore no-explicit-any
  const conversation_states: any =
    defs[unhandled_message.chatbot_name].conversation_states

  let chatbot_user = await conversations.findChatbotUser(
    trx,
    unhandled_message.chatbot_name,
    unhandled_message.sent_by_phone_number,
  )
  let nextConversationState: string
  let nextState
  let userState: ChatbotUserState

  if (!chatbot_user) {
    nextConversationState = 'initial_message'
    nextState = conversation_states.initial_message
    chatbot_user = await conversations.insertChatbotUser(
      trx,
      unhandled_message.chatbot_name,
      unhandled_message.sent_by_phone_number,
    )

    userState = {
      unhandled_message,
      chatbot_user: {
        id: chatbot_user.id,
        entity_id: chatbot_user.entity_id,
        // deno-lint-ignore no-explicit-any
        conversation_state: chatbot_user.conversation_state as any,
        chatbot_name: unhandled_message.chatbot_name,
        data: isObjectLike(chatbot_user.data) ? chatbot_user.data : {},
      },
    }
  } else {
    userState = {
      unhandled_message,
      chatbot_user: {
        id: chatbot_user.id,
        data: isObjectLike(chatbot_user.data) ? chatbot_user.data : {},
        entity_id: chatbot_user.entity_id,

        chatbot_name: unhandled_message.chatbot_name,
        // deno-lint-ignore no-explicit-any
        conversation_state: chatbot_user.conversation_state as any,
      },
    }

    const currentState = await findMatchingState(trx, userState)

    if (!currentState) {
      nextConversationState = 'error'
      nextState =
        defs[userState.chatbot_user.chatbot_name].conversation_states.error
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

  return formatMessageToSend(trx, userState, nextState)
}
