import { assert } from 'std/assert/assert.ts'
import {
  PharmacistChatbotUserState,
  PharmacistConversationState,
  TrxOrDb,
} from '../../types.ts'
import * as messages from '../../db/models/messages.ts'
import { handleDispense } from './prescriptionMedications.ts'

export async function handleAskPrescriber(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<PharmacistConversationState> {
  const message = pharmacistState.unhandled_message.trimmed_body
  if (message === 'done' || message === 'dispense') {
    return handleDispense(trx, pharmacistState)
  }

  const { prescription_id } = pharmacistState.chatbot_user.data
  assert(
    prescription_id,
    'Cannot messsage prescriber about prescription as no prescription can be found',
  )

  await await makeThreadIfNotExists
  await sendMessage

  return 'onboarded:fill_prescription:ask_prescriber'
}
