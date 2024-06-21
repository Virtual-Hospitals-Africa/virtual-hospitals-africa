import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import {
  ChatbotUserState,
  ConversationStates,
  TrxOrDb,
  UnhandledMessage,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'

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

export async function determineResponse(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
): Promise<WhatsAppSingleSendable | WhatsAppSendable> {
  const entity = await findOrInsertEntity(trx, unhandled_message)

  const conversation_state_prior_to_handling_incoming_message = (await trx
    .selectFrom(`${unhandled_message.chatbot_name}_whatsapp_messages_received`)
    .innerJoin(
      'whatsapp_messages_received',
      'whatsapp_messages_received.id',
      `${unhandled_message.chatbot_name}_whatsapp_messages_received.whatsapp_message_received_id`,
    )
    .select([
      `${unhandled_message.chatbot_name}_whatsapp_messages_received.conversation_state`,
    ])
    .where(`${unhandled_message.chatbot_name}_id`, '=', entity.id)
    .orderBy('whatsapp_messages_received.created_at', 'desc')
    .executeTakeFirst())?.conversation_state || 'initial_message'

  const userState: ChatbotUserState = {
    entity_id: entity.id,
    unhandled_message,
    chatbot_name: unhandled_message.chatbot_name,
    conversation_state:
      conversation_state_prior_to_handling_incoming_message as any,
  }

  const currentState = findMatchingState(userState)

  if (!currentState) {
    throw new Error(
      `No matching state found for ${userState.conversation_state}`,
    )
    // const originalMessageSent = formatMessageToSend(
    //   conversationStates,
    //   userState,
    // )
    // if (Array.isArray(originalMessageSent)) {
    //   return [
    //     {
    //       ...originalMessageSent[0],
    //       messageBody: sorry(originalMessageSent[0].messageBody),
    //     },
    //     {
    //       ...originalMessageSent[1],
    //       messageBody: sorry(originalMessageSent[1].messageBody),
    //     },
    //   ]
    // } else {
    //   return {
    //     ...originalMessageSent,
    //     messageBody: sorry(originalMessageSent.messageBody),
    //   }
    // }
  }

  const nextConversationState = typeof currentState.nextState === 'string'
    ? currentState.nextState
    : currentState.nextState(userState)

  if (currentState.onExit) {
    await currentState.onExit(trx, userState)
  }

  // if (nextConversationState.onEnter) {
  //   userState = await nextConversationState.onEnter(trx, userState)
  // }

  console.log('xx', {
    whatsapp_message_received_id: unhandled_message.message_received_id,
    [`${unhandled_message.chatbot_name}_id`]: entity.id,
    conversation_state: nextConversationState,
  })

  console.log(
    'yy',
    await trx.selectFrom('pharmacists')
      .selectAll()
      .where('id', '=', entity.id)
      .execute(),
  )
  await trx
    .insertInto(`${unhandled_message.chatbot_name}_whatsapp_messages_received`)
    .values({
      whatsapp_message_received_id: unhandled_message.message_received_id,
      [`${unhandled_message.chatbot_name}_id`]: entity.id,
      conversation_state: nextConversationState,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return await formatMessageToSend(userState, currentState as any)
}
