import {
  PharmacistChatbotUserState,
  PharmacistConversationState,
  TrxOrDb,
} from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as pharmacists from '../../db/models/pharmacists.ts'
import * as pharmacies from '../../db/models/pharmacies.ts'
import { assert } from 'std/assert/assert.ts'

export async function handleLicenceInput(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<PharmacistConversationState> {
  const licence_number = pharmacistState.unhandled_message.trimmed_body
  if (!licence_number) {
    return 'not_onboarded:reenter_licence_number'
  }
  const pharmacist = await pharmacists.getByLicenceNumber(trx, licence_number)

  if (!pharmacist) {
    return 'not_onboarded:reenter_licence_number'
  }

  const today = new Date().toISOString()
  if (pharmacist.expiry_date < today) {
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

export async function handlePharmacyLicenceInput(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<PharmacistConversationState> {
  const pharmacy_licence_number = pharmacistState.unhandled_message.trimmed_body
  if (!pharmacy_licence_number) {
    return 'not_onboarded:reenter_pharmacy_licence'
  }
  const pharmacy = await pharmacies.getByLicenceNumber(
    trx,
    pharmacy_licence_number,
  )
  if (!pharmacy) {
    return 'not_onboarded:reenter_pharmacy_licence'
  }

  const { licence_number } = pharmacistState.chatbot_user.data
  assert(typeof licence_number === 'string')

  const pharmacist = await pharmacists.getByLicenceNumber(trx, licence_number)
  assert(
    pharmacist,
    'The chatbot should not have let the pharmacist proceed with a licence number not corresponding with an extant pharmacist',
  )

  const works_at_pharmacy = pharmacist.pharmacies.some((p) =>
    p.id === pharmacy.id
  )

  if (!works_at_pharmacy) {
    return 'not_onboarded:incorrect_pharmacy_licence'
  }

  const today = new Date().toISOString()
  if (pharmacy.expiry_date < today) {
    return 'not_onboarded:pharmacy_licence_expired'
  }

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...pharmacistState.chatbot_user.data,
        pharmacy_licence_number,
      },
    },
  )

  return 'not_onboarded:confirm_pharmacy'
}
