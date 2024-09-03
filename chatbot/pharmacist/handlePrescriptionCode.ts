import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'

export async function handlePrescriptionCode(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const code = pharmacistState.unhandled_message.trimmed_body!
  const prescription = await prescriptions.getByCode(trx, code)
  if (!prescription) {
    return 'onboarded:fill_prescription:reenter_code'
  }

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        prescription_code: code,
        prescription_id: prescription.id,
      },
    },
  )

  return 'onboarded:fill_prescription:send_pdf' as const
}
