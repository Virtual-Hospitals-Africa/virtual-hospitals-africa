import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import {
  ChatbotUserState,
  TrxOrDb,
  UnhandledMessage,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import * as conversations from '../db/models/conversations.ts'
import * as defs from './defs.ts'
import { assert } from 'std/assert/assert.ts'

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

export async function determineResponse(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
): Promise<WhatsAppSingleSendable | WhatsAppSendable> {
  // deno-lint-ignore no-explicit-any
  const conversation_states: any =
    defs[unhandled_message.chatbot_name].conversation_states

  const entity = await findOrInsertEntity(trx, unhandled_message)

  const past_conversation_state = (await conversations.getLastConversationState(
    trx,
    unhandled_message.chatbot_name,
    {
      entity_id: entity.id,
    },
  ))?.conversation_state

  const userState: ChatbotUserState = {
    entity_id: entity.id,
    unhandled_message,
    chatbot_name: unhandled_message.chatbot_name,
    conversation_state:
      // deno-lint-ignore no-explicit-any
      past_conversation_state as any,
  }

  let nextConversationState: string
  let nextState

  if (!past_conversation_state) {
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

  await trx
    .insertInto(`${unhandled_message.chatbot_name}_whatsapp_messages_received`)
    .values({
      whatsapp_message_received_id: unhandled_message.message_received_id,
      // deno-lint-ignore no-explicit-any
      conversation_state: nextConversationState as any,
      [`${unhandled_message.chatbot_name}_id`]: entity.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  console.log('nextConversationState', nextConversationState)
  assert(nextState, 'nextState not found')

  return await formatMessageToSend(trx, userState, nextState)
}
