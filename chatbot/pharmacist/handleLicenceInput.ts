import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'
import { getPharmacy } from '../../db/models/pharmacists.ts'
import { assert } from 'std/assert/assert.ts'

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

export async function handlePharmacyLicenceInput(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const pharmacy_licence_number = pharmacistState.unhandled_message.trimmed_body
  if (!pharmacy_licence_number) {
    return 'not_onboarded:enter_pharmacy_number' as const
  }

  const pharmacist_id = pharmacistState.chatbot_user.entity_id
  assert(typeof pharmacist_id === 'string')
  const pharmacy = await getPharmacy(trx, pharmacist_id)

  try {
    if (!pharmacy) {
      throw new Error(
        'Cannot find a pharmacy with that pharmacist',
      )
    }
  } catch (err) {
    console.log(err)
    return 'not_onboarded:reenter_pharmacy_number' as const
  }

  const today = new Date()
  if (pharmacy.expiry_date < today) {
    return 'not_onboarded:pharmacy_licence_expired' as const
  }

  if (pharmacy_licence_number != pharmacy.licence_number) {
    return 'not_onboarded:reenter_pharmacy_number'
  }

  return 'not_onboarded:share_location' as const
}
