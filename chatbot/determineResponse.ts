import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import conversationStates from './conversationStates.ts'
import { TrxOrDb, UnhandledPatientMessage, WhatsAppSendable } from '../types.ts'
import * as patients from '../db/models/patients.ts'
import pickPatient from './pickPatient.ts'

const sorry = (msg: string) => `Sorry, I didn't understand that.\n\n${msg}`

export async function determineResponse(
  trx: TrxOrDb,
  patientMessage: UnhandledPatientMessage,
): Promise<WhatsAppSendable> {
  const currentState = findMatchingState(patientMessage)

  if (currentState === 'invalid_response') {
    const originalMessageSent = formatMessageToSend(patientMessage)
    return {
      ...originalMessageSent,
      messageBody: sorry(originalMessageSent.messageBody),
    }
  }

  const nextState = typeof currentState.nextState === 'string'
    ? currentState.nextState
    : currentState.nextState(patientMessage)

  patientMessage = {
    ...patientMessage,
    conversation_state: nextState,
  }

  await patients.upsert(trx, pickPatient(patientMessage))

  if (currentState.onExit) {
    patientMessage = await currentState.onExit(trx, patientMessage)
  }

  const nextConversationState =
    conversationStates[patientMessage.conversation_state]

  if (nextConversationState.onEnter) {
    patientMessage = await nextConversationState.onEnter(trx, patientMessage)
  }

  return formatMessageToSend(patientMessage)
}
