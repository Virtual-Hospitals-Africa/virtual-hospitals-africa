import { PharmacistChatbotUserState, PharmacistConversationState, TrxOrDb } from '../../types.ts'
import { conversations } from '../../db/models/conversations.ts'
import { pharmacists } from '../../db/models/pharmacists.ts'

export async function handleLicenceInput(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<PharmacistConversationState> {
  const licence_number = pharmacistState.unhandled_message.trimmed_body
  if (!licence_number) {
    return 'not_onboarded:reenter_licence_number'
  }
  const pharmacist = await pharmacists.getByLicence(trx, licence_number)

  if (!pharmacist) {
    return 'not_onboarded:reenter_licence_number'
  }

  const pharmacist_licence = pharmacist.organizations.flatMap((o) => o.active_licences).find((licence) => {
    licence.regulatory_agency.acronym === pharmacists.agency.acronym
  })!
  if (pharmacist_licence.status === 'expired') {
    return 'not_onboarded:licence_expired'
  }
  if (pharmacist_licence.status === 'revoked') {
    // TODO return 'not_onboarded:licence_revoked'
    return 'not_onboarded:licence_expired'
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

  return 'not_onboarded:confirm_name'
}
