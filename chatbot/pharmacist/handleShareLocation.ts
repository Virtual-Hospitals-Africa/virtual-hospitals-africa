import { Location, PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as pharmacists from '../../db/models/pharmacists.ts'
import { assert } from 'std/assert/assert.ts'

export async function handleShareLocation(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { licence_number, pharmacy_licence_number } =
    pharmacistState.chatbot_user.data
  assert(typeof licence_number === 'string')
  assert(typeof pharmacy_licence_number === 'string')

  let location: Location
  try {
    assert(pharmacistState.unhandled_message.trimmed_body)
    const locationMessage: Location = JSON.parse(
      pharmacistState.unhandled_message.trimmed_body,
    )
    location = {
      longitude: locationMessage.longitude,
      latitude: locationMessage.latitude,
    }
  } catch (err) {
    console.error(err)
    return 'not_onboarded:reshare_location' as const
  }

  const pharmacist = await pharmacists.getByLicenceNumber(trx, licence_number)
  assert(pharmacist, 'Pharmacist not found')

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      entity_id: pharmacist.id,
      data: {
        ...pharmacistState.chatbot_user.data,
        location,
      },
    },
  )
  return 'onboarded:fill_prescription:enter_code' as const
}
