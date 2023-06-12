import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import {
  ConversationStates,
  TrxOrDb,
  UserState,
  WhatsAppSendable,
} from '../types.ts'

const sorry = (msg: string) => `Sorry, I didn't understand that.\n\n${msg}`

export async function determineResponse<
  CS extends string,
  US extends UserState<CS>,
>(
  trx: TrxOrDb,
  conversationStates: ConversationStates<US['conversation_state'], US>,
  userState: US,
  // deno-lint-ignore no-explicit-any
  updateState: (trx: TrxOrDb, userState: US) => Promise<any>,
): Promise<WhatsAppSendable> {
  const currentState = findMatchingState(conversationStates, userState)

  if (!currentState) {
    const originalMessageSent = formatMessageToSend(
      conversationStates,
      userState,
    )
    return {
      ...originalMessageSent,
      messageBody: sorry(originalMessageSent.messageBody),
    }
  }

  const nextState = typeof currentState.nextState === 'string'
    ? currentState.nextState
    : currentState.nextState(userState)

  userState = {
    ...userState,
    conversation_state: nextState,
  }

  await updateState(trx, userState)

  if (currentState.onExit) {
    userState = await currentState.onExit(trx, userState)
  }

  const nextConversationState = conversationStates[userState.conversation_state]

  if (nextConversationState.onEnter) {
    userState = await nextConversationState.onEnter(trx, userState)
  }

  return formatMessageToSend(conversationStates, userState)
}
