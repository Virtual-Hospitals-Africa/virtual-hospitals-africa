import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import {
  ChatbotUserState,
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

// User sends first message
//

export async function determineResponse(
  trx: TrxOrDb,
  unhandled_message: UnhandledMessage,
): Promise<WhatsAppSingleSendable | WhatsAppSendable> {
  const entity = await findOrInsertEntity(trx, unhandled_message)

  const past_conversation_state = (await trx
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
    .executeTakeFirst())?.conversation_state

  if (!past_conversation_state) {
    await trx
      .insertInto(
        `${unhandled_message.chatbot_name}_whatsapp_messages_received`,
      )
      .values({
        whatsapp_message_received_id: unhandled_message.message_received_id,
        conversation_state: 'initial_message',
        [`${unhandled_message.chatbot_name}_id`]: entity.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      type: 'string',
      messageBody:
        `Welcome to the Pharmacist Chatbot! This is a demo to showcase the capabilities of the chatbot. Please follow the prompts to complete the demo.\n\nTo start, enter your registration number.`,
    }
  }

  const userState: ChatbotUserState = {
    entity_id: entity.id,
    unhandled_message,
    chatbot_name: unhandled_message.chatbot_name,
    conversation_state:
      // deno-lint-ignore no-explicit-any
      past_conversation_state as any,
  }

  const currentState = findMatchingState(userState)

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

  const next_conversation_state = await currentState.onExit(trx, userState)

  await trx
    .insertInto(`${unhandled_message.chatbot_name}_whatsapp_messages_received`)
    .values({
      whatsapp_message_received_id: unhandled_message.message_received_id,
      conversation_state: next_conversation_state as any,
      [`${unhandled_message.chatbot_name}_id`]: entity.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const nextState = findMatchingState({
    ...userState,
    conversation_state: next_conversation_state as any,
  })

  // deno-lint-ignore no-explicit-any
  return await formatMessageToSend(trx, userState, nextState as any)
}
