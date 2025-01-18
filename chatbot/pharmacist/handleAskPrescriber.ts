import { assert } from 'std/assert/assert.ts'
import {
  PharmacistChatbotUserState,
  PharmacistConversationState,
  TrxOrDb,
} from '../../types.ts'
import * as messages from '../../db/models/messages.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import { handleDispense } from './prescriptionMedications.ts'
import isObjectLike from '../../util/isObjectLike.ts'

export async function handleAskPrescriber(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<PharmacistConversationState> {
  const body = pharmacistState.unhandled_message.trimmed_body
  if (body === 'done' || body === 'dispense') {
    return handleDispense(trx, pharmacistState)
  }

  assert(body, 'Expected a message, not an attachment or something else')

  const { prescription_id, thread } = pharmacistState.chatbot_user.data
  assert(
    typeof prescription_id === 'string',
    'Cannot messsage prescriber about prescription as no prescription can be found',
  )

  const prescription = await prescriptions.getById(trx, prescription_id)
  assert(
    prescription,
    'Cannot messsage prescriber about prescription as no prescription can be found',
  )

  if (
    isObjectLike(thread) && typeof thread.thread_id === 'string' &&
    typeof thread.sender_participant_id === 'string'
  ) {
    await messages.send(trx, {
      thread_id: thread.thread_id,
      body,
      sender: {
        participant_id: thread.sender_participant_id,
      },
    })
  } else {
    const thread = await messages.createThread(trx, {
      sender: {
        pharmacist_id: pharmacistState.chatbot_user.entity_id!,
      },
      recipient: {
        employment_id: prescription.prescriber_id,
      },
      concerning: {
        patient_id: prescription.patient_id,
      },
      initial_message: {
        body: body,
      },
    })
    await conversations.updateChatbotUser(
      trx,
      pharmacistState.chatbot_user,
      {
        data: {
          ...pharmacistState.chatbot_user.data,
          thread_id: thread.thread_id,
          sender_participant_id: thread.sender_participant_id,
        },
      },
    )
  }
  return 'onboarded:fill_prescription:ask_prescriber_continue' as const
}
