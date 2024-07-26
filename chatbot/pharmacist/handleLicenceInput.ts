import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'

export async function handleLicenceInput(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const licence_number = pharmacistState.unhandled_message.trimmed_body
  if (!licence_number) {
    return 'not_onboarded:reenter_licence_number' as const
  }
  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...pharmacistState.chatbot_user.data,
        licence_number,
      },
    },
  )
  return 'not_onboarded:enter_name' as const
}
