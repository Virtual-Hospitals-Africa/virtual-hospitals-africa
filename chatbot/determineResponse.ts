import findMatchingState from './findMatchingState.ts'
import formatMessageToSend from './formatMessageToSend.ts'
import conversationStates from './conversationStates.ts'
import { PatientState, TrxOrDb, WhatsAppSendable } from '../types.ts'
import * as patients from '../db/models/patients.ts'
import pickPatient from './pickPatient.ts'

const sorry = (msg: string) => `Sorry, I didn't understand that.\n\n${msg}`

export async function determineResponse(
  trx: TrxOrDb,
  patientState: PatientState,
): Promise<WhatsAppSendable> {
  const currentState = findMatchingState(patientState)

  if (!currentState) {
    const originalMessageSent = formatMessageToSend(patientState)
    return {
      ...originalMessageSent,
      messageBody: sorry(originalMessageSent.messageBody),
    }
  }

  const nextState = typeof currentState.nextState === 'string'
    ? currentState.nextState
    : currentState.nextState(patientState)

  patientState = {
    ...patientState,
    conversation_state: nextState,
  }

  await patients.upsert(trx, pickPatient(patientState))

  if (currentState.onExit) {
    patientState = await currentState.onExit(trx, patientState)
  }

  const nextConversationState =
    conversationStates[patientState.conversation_state]

  if (nextConversationState.onEnter) {
    patientState = await nextConversationState.onEnter(trx, patientState)
  }

  return formatMessageToSend(patientState)
}
